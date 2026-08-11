// @ts-nocheck
import { TIMING } from '@geoalerta/shared';
import type { WsMessage, WsMessageType } from '@geoalerta/shared';

type MessageHandler = (msg: WsMessage) => void;

/**
 * WebSocket client with auto-reconnect (exponential backoff).
 * Maintains persistent connection to the alert hub.
 */
export class AlertWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private handlers = new Map<string, MessageHandler[]>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(baseUrl: string, token: string) {
    this.url = baseUrl;
    this.token = token;
  }

  connect() {
    this.isIntentionallyClosed = false;
    const wsUrl = `${this.url}?token=${this.token}`;

    try {
      this.ws = new WebSocket(wsUrl);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('_connected', { type: '_connected', ts: Date.now() });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        this.emit(msg.type, msg);
      } catch {
        console.warn('Invalid WS message received');
      }
    };

    this.ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);
      this.stopHeartbeat();
      this.emit('_disconnected', { type: '_disconnected', ts: Date.now() });

      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close(1000, 'Client disconnect');
    this.ws = null;
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: string, handler: MessageHandler) {
    const existing = this.handlers.get(type) || [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  off(type: string, handler: MessageHandler) {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(type, existing.filter((h) => h !== handler));
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private emit(type: string, msg: WsMessage) {
    const handlers = this.handlers.get(type) || [];
    handlers.forEach((h) => h(msg));

    // Also emit to wildcard listeners
    const wildcardHandlers = this.handlers.get('*') || [];
    wildcardHandlers.forEach((h) => h(msg));
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', ts: Date.now() });
    }, TIMING.WS_HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= TIMING.WS_MAX_RECONNECT_ATTEMPTS) {
      console.warn('🔌 Max reconnect attempts reached');
      this.emit('_max_retries', { type: '_max_retries', ts: Date.now() });
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = TIMING.WS_RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`🔌 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${TIMING.WS_MAX_RECONNECT_ATTEMPTS})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}
