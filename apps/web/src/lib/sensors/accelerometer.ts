import { SENSOR_CONFIG } from '@geoalerta/shared';

export type AccelSample = { x: number; y: number; z: number; magnitude: number; ts: number };
type AccelCallback = (sample: AccelSample) => void;

/**
 * Accelerometer access layer.
 * Uses Generic Sensor API with fallback to DeviceMotionEvent.
 */
export class AccelerometerService {
  private callback: AccelCallback | null = null;
  private sensorInstance: any = null;
  private isRunning = false;

  get available(): boolean {
    return 'Accelerometer' in window || 'DeviceMotionEvent' in window;
  }

  async requestPermission(): Promise<boolean> {
    // iOS requires explicit permission for DeviceMotion
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      return permission === 'granted';
    }
    // Generic Sensor API permission
    if ('Accelerometer' in window) {
      try {
        const result = await navigator.permissions.query({ name: 'accelerometer' as PermissionName });
        return result.state === 'granted' || result.state === 'prompt';
      } catch {
        return true; // Assume available if query fails
      }
    }
    return this.available;
  }

  start(callback: AccelCallback): boolean {
    this.callback = callback;

    // Try Generic Sensor API first (higher quality, configurable frequency)
    if ('Accelerometer' in window) {
      try {
        const sensor = new (window as any).Accelerometer({
          frequency: SENSOR_CONFIG.SAMPLE_RATE_HZ,
        });
        sensor.addEventListener('reading', () => {
          const magnitude = Math.sqrt(sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2);
          this.callback?.({
            x: sensor.x,
            y: sensor.y,
            z: sensor.z,
            magnitude,
            ts: Date.now(),
          });
        });
        sensor.addEventListener('error', (e: any) => {
          console.warn('Accelerometer error, falling back to DeviceMotion:', e.error.message);
          this.startDeviceMotionFallback();
        });
        sensor.start();
        this.sensorInstance = sensor;
        this.isRunning = true;
        return true;
      } catch {
        // Fall through to DeviceMotion
      }
    }

    return this.startDeviceMotionFallback();
  }

  private startDeviceMotionFallback(): boolean {
    if (!('DeviceMotionEvent' in window)) return false;

    const handler = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
      this.callback?.({
        x: accel.x,
        y: accel.y,
        z: accel.z,
        magnitude,
        ts: Date.now(),
      });
    };

    window.addEventListener('devicemotion', handler);
    this.sensorInstance = handler;
    this.isRunning = true;
    return true;
  }

  stop() {
    if (!this.isRunning) return;

    if (this.sensorInstance?.stop) {
      this.sensorInstance.stop();
    } else if (typeof this.sensorInstance === 'function') {
      window.removeEventListener('devicemotion', this.sensorInstance);
    }

    this.sensorInstance = null;
    this.callback = null;
    this.isRunning = false;
  }
}
