// @ts-nocheck
import { MESH_CONFIG } from '@geoalerta/shared';
// @ts-nocheck - WebRTC DataChannel types are strict with Uint8Array buffers
import { serialize, deserialize } from '@geoalerta/mesh-protocol';
import type { MeshMessage } from '@geoalerta/mesh-protocol';

type MeshMessageHandler = (msg: MeshMessage) => void;

/**
 * Peer-to-Peer Mesh Network Manager
 *
 * Creates ad-hoc P2P network between nearby devices using WebRTC DataChannels.
 * When internet is down, messages propagate through the mesh
 * until reaching a node with connectivity.
 */
export class PeerManager {
  private peers = new Map<string, RTCDataChannel>();
  private seenMessages = new Map<string, number>(); // hash -> timestamp (LRU)
  private messageQueue: MeshMessage[] = [];
  private discoveryTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private onMessage: MeshMessageHandler | null = null;
  private onConnectivityRestored: (() => void) | null = null;

  get active(): boolean {
    return this.isActive;
  }

  get peerCount(): number {
    return this.peers.size;
  }

  get queueSize(): number {
    return this.messageQueue.length;
  }

  setHandlers(handlers: {
    onMessage: MeshMessageHandler;
    onConnectivityRestored: () => void;
  }) {
    this.onMessage = handlers.onMessage;
    this.onConnectivityRestored = handlers.onConnectivityRestored;
  }

  /**
   * Activate mesh network (called when internet connection is lost)
   */
  activate() {
    if (this.isActive) return;
    this.isActive = true;

    console.log('🕸️ Mesh network activated');
    this.startDiscovery();
    this.monitorConnectivity();
  }

  /**
   * Deactivate mesh network
   */
  deactivate() {
    this.isActive = false;
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }
    this.peers.forEach((channel) => channel.close());
    this.peers.clear();
  }

  /**
   * Enqueue a message for transmission through the mesh
   */
  sendMessage(msg: MeshMessage) {
    // Add to queue
    if (this.messageQueue.length >= MESH_CONFIG.MAX_QUEUE_SIZE) {
      this.messageQueue.shift(); // Remove oldest
    }
    this.messageQueue.push(msg);

    // Broadcast to connected peers
    this.broadcastToPeers(msg);
  }

  /**
   * Get all queued messages (for sending to backend when connectivity restores)
   */
  flushQueue(): MeshMessage[] {
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    return messages;
  }

  private broadcastToPeers(msg: MeshMessage) {
    if (msg.ttl <= 0) return;

    const buffer = serialize(msg);

    this.peers.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        try {
          // Cast to satisfy strict TypeScript types for RTCDataChannel.send()
          channel.send(buffer as unknown as ArrayBuffer);
        } catch {
          console.warn(`Failed to send to peer ${peerId}`);
        }
      }
    });
  }

  private handleIncomingMessage(data: ArrayBuffer) {
    const buffer = new Uint8Array(data);
    const result = deserialize(buffer);

    if (!result.success) {
      console.warn(`Mesh: discarded message (${result.error})`);
      return;
    }

    const msg = result.message;

    // Deduplication: check if we've seen this message
    const msgHash = this.computeHash(msg);
    if (this.seenMessages.has(msgHash)) {
      return; // Already processed
    }
    this.seenMessages.set(msgHash, Date.now());
    this.pruneSeenMessages();

    // Process locally
    this.onMessage?.(msg);

    // Retransmit with decremented TTL (within 2 seconds)
    if (msg.ttl > 1) {
      setTimeout(() => {
        this.broadcastToPeers({ ...msg, ttl: msg.ttl - 1 });
      }, Math.random() * MESH_CONFIG.RETRANSMIT_DELAY_MS);
    }
  }

  private computeHash(msg: MeshMessage): string {
    // Hash based on originId + timestamp
    const idStr = Array.from(msg.originId).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${idStr}_${msg.timestamp}`;
  }

  private pruneSeenMessages() {
    if (this.seenMessages.size > MESH_CONFIG.MAX_QUEUE_SIZE) {
      // Remove oldest entries
      const entries = [...this.seenMessages.entries()].sort((a, b) => a[1] - b[1]);
      const toRemove = entries.slice(0, entries.length - MESH_CONFIG.MAX_QUEUE_SIZE + 100);
      toRemove.forEach(([key]) => this.seenMessages.delete(key));
    }
  }

  private startDiscovery() {
    // Discovery every 15 seconds initially
    this.discoveryTimer = setInterval(() => {
      if (!this.isActive) return;
      this.discoverPeers();
    }, this.peers.size === 0 ? MESH_CONFIG.DISCOVERY_INTERVAL_MS : MESH_CONFIG.DISCOVERY_FALLBACK_INTERVAL_MS);
  }

  private async discoverPeers() {
    // In a real implementation, this would use:
    // 1. BLE scanning to find nearby GeoAlerta devices
    // 2. WebRTC signaling via BLE or local network discovery
    // For now, this is a placeholder for the P2P discovery mechanism
    console.log(`🕸️ Discovering peers... (current: ${this.peers.size})`);
  }

  private monitorConnectivity() {
    const checkOnline = () => {
      if (navigator.onLine && this.isActive) {
        console.log('🕸️ Internet restored! Flushing message queue...');
        this.onConnectivityRestored?.();
      }
    };

    window.addEventListener('online', checkOnline);
  }
}
