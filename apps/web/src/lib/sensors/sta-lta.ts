import { SENSOR_CONFIG } from '@geoalerta/shared';

/**
 * STA/LTA (Short-Term Average / Long-Term Average) algorithm
 * for P-wave detection on mobile devices.
 *
 * - STA window: 1 second (50 samples at 50Hz)
 * - LTA window: 30 seconds (1500 samples at 50Hz)
 * - Trigger threshold: ratio >= 2.5
 *
 * When triggered, fires a callback immediately (<100ms)
 * without waiting for server confirmation.
 */
export class StaLtaDetector {
  private readonly staSize: number;
  private readonly ltaSize: number;
  private readonly threshold: number;
  private buffer: number[] = [];
  private onTrigger: ((ratio: number, peakAccel: number) => void) | null = null;
  private lastTriggerTime = 0;
  private readonly minTriggerIntervalMs = 10_000; // Avoid multiple triggers within 10s

  constructor() {
    this.staSize = SENSOR_CONFIG.STA_WINDOW_SEC * SENSOR_CONFIG.SAMPLE_RATE_HZ; // 50
    this.ltaSize = SENSOR_CONFIG.LTA_WINDOW_SEC * SENSOR_CONFIG.SAMPLE_RATE_HZ; // 1500
    this.threshold = SENSOR_CONFIG.TRIGGER_THRESHOLD; // 2.5
  }

  setTriggerCallback(cb: (ratio: number, peakAccel: number) => void) {
    this.onTrigger = cb;
  }

  /**
   * Feed a new acceleration magnitude sample (in m/s²).
   * Call this at 50Hz from the accelerometer.
   */
  feed(magnitude: number): { ratio: number; triggered: boolean } {
    // Remove gravity component (~9.81 m/s²) to get motion acceleration
    const accel = Math.abs(magnitude - 9.81);
    this.buffer.push(accel);

    // Keep buffer at max LTA size
    if (this.buffer.length > this.ltaSize) {
      this.buffer.shift();
    }

    // Need at least LTA window filled to compute valid ratio
    if (this.buffer.length < this.ltaSize) {
      return { ratio: 0, triggered: false };
    }

    // Compute STA: average of last N samples
    const staSlice = this.buffer.slice(-this.staSize);
    const sta = staSlice.reduce((sum, v) => sum + v, 0) / this.staSize;

    // Compute LTA: average of all buffer samples
    const lta = this.buffer.reduce((sum, v) => sum + v, 0) / this.ltaSize;

    // Avoid division by zero
    if (lta < 0.0001) {
      return { ratio: 0, triggered: false };
    }

    const ratio = sta / lta;

    // Check trigger
    const now = Date.now();
    const triggered = ratio >= this.threshold && now - this.lastTriggerTime > this.minTriggerIntervalMs;

    if (triggered) {
      this.lastTriggerTime = now;
      const peakAccel = Math.max(...staSlice);
      this.onTrigger?.(ratio, peakAccel);
    }

    return { ratio, triggered };
  }

  /**
   * Reset the detector (e.g., after a confirmed false positive)
   */
  reset() {
    this.buffer = [];
    this.lastTriggerTime = 0;
  }

  /**
   * Get current buffer fill percentage (0-1)
   */
  get bufferFill(): number {
    return this.buffer.length / this.ltaSize;
  }
}
