import { SENSOR_CONFIG, TIMING } from '@geoalerta/shared';
import { AccelerometerService, type AccelSample } from './accelerometer';
import { StaLtaDetector } from './sta-lta';

export type PWaveEvent = {
  ratio: number;
  peakAccel: number;
  timestamp: string;
  location?: { lat: number; lng: number };
};

type PWaveCallback = (event: PWaveEvent) => void;

/**
 * P-Wave Detection Engine
 *
 * Combines accelerometer + STA/LTA to detect seismic P-waves locally.
 * Fires pre-alert in <100ms without server confirmation.
 * After 10s without server confirmation, cancels the pre-alert.
 */
export class PWaveEngine {
  private accelerometer = new AccelerometerService();
  private detector = new StaLtaDetector();
  private onPreAlert: PWaveCallback | null = null;
  private onConfirmed: PWaveCallback | null = null;
  private onCancelled: (() => void) | null = null;
  private confirmationTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private pendingEvent: PWaveEvent | null = null;

  get available(): boolean {
    return this.accelerometer.available;
  }

  get active(): boolean {
    return this.isActive;
  }

  get bufferReady(): number {
    return this.detector.bufferFill;
  }

  setCallbacks(cbs: {
    onPreAlert: PWaveCallback;
    onConfirmed: PWaveCallback;
    onCancelled: () => void;
  }) {
    this.onPreAlert = cbs.onPreAlert;
    this.onConfirmed = cbs.onConfirmed;
    this.onCancelled = cbs.onCancelled;
  }

  async start(): Promise<boolean> {
    const hasPermission = await this.accelerometer.requestPermission();
    if (!hasPermission) return false;

    // Set up STA/LTA trigger
    this.detector.setTriggerCallback((ratio, peakAccel) => {
      this.handleTrigger(ratio, peakAccel);
    });

    // Start accelerometer feed
    const started = this.accelerometer.start((sample: AccelSample) => {
      this.detector.feed(sample.magnitude);
    });

    this.isActive = started;
    return started;
  }

  stop() {
    this.accelerometer.stop();
    this.isActive = false;
    if (this.confirmationTimer) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
  }

  /**
   * Called by WebSocket handler when server confirms the event
   */
  confirmEvent() {
    if (this.confirmationTimer) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
    if (this.pendingEvent) {
      this.onConfirmed?.(this.pendingEvent);
      this.pendingEvent = null;
    }
  }

  /**
   * Called by WebSocket handler when server cancels (no correlation)
   */
  cancelEvent() {
    if (this.confirmationTimer) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
    this.pendingEvent = null;
    this.onCancelled?.();
  }

  private handleTrigger(ratio: number, peakAccel: number) {
    const event: PWaveEvent = {
      ratio,
      peakAccel,
      timestamp: new Date().toISOString(),
    };

    // Try to attach current GPS location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          event.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {}, // ignore error
        { timeout: 2000, maximumAge: 10000 },
      );
    }

    this.pendingEvent = event;

    // Fire pre-alert immediately (<100ms)
    this.onPreAlert?.(event);

    // Start confirmation timer (10 seconds)
    this.confirmationTimer = setTimeout(() => {
      // No confirmation received → cancel pre-alert
      this.pendingEvent = null;
      this.onCancelled?.();
    }, SENSOR_CONFIG.CONFIRMATION_TIMEOUT_SEC * 1000);
  }
}
