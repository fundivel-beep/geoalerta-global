import { TIMING, STORAGE_CONFIG } from '@geoalerta/shared';

type LocationReport = {
  lat: number;
  lng: number;
  precision_m: number;
  timestamp: string;
  battery?: number;
};

type LocationCallback = (report: LocationReport) => void;

/**
 * GPS Location Tracker
 *
 * - Normal mode: reports every 5 minutes
 * - Alert mode: reports every 30 seconds
 * - Stores locally when offline (max 500 records)
 */
export class LocationTracker {
  private watchId: number | null = null;
  private reportTimer: NodeJS.Timeout | null = null;
  private isAlertMode = false;
  private lastPosition: GeolocationPosition | null = null;
  private pendingReports: LocationReport[] = [];
  private onReport: LocationCallback | null = null;
  private isRunning = false;

  get hasPermission(): boolean {
    return this.watchId !== null;
  }

  get pendingCount(): number {
    return this.pendingReports.length;
  }

  setReportCallback(cb: LocationCallback) {
    this.onReport = cb;
  }

  /**
   * Request geolocation permission and start tracking
   */
  async start(): Promise<boolean> {
    if (!('geolocation' in navigator)) return false;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lastPosition = pos;
          this.startPeriodicReporting();
          this.startWatching();
          this.isRunning = true;
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    this.isRunning = false;
  }

  /**
   * Switch to alert mode (30s interval)
   */
  setAlertMode(active: boolean) {
    if (this.isAlertMode === active) return;
    this.isAlertMode = active;

    // Restart timer with new interval
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    this.startPeriodicReporting();

    // Immediately report current location on alert
    if (active && this.lastPosition) {
      this.sendReport(this.lastPosition);
    }
  }

  /**
   * Get last known position
   */
  getLastPosition(): { lat: number; lng: number } | null {
    if (!this.lastPosition) return null;
    return {
      lat: this.lastPosition.coords.latitude,
      lng: this.lastPosition.coords.longitude,
    };
  }

  /**
   * Flush pending reports (call when connectivity restores)
   */
  flushPending(): LocationReport[] {
    const reports = [...this.pendingReports];
    this.pendingReports = [];
    return reports;
  }

  private startWatching() {
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.lastPosition = pos;
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
  }

  private startPeriodicReporting() {
    const interval = this.isAlertMode
      ? TIMING.LOCATION_ALERT_INTERVAL_MS
      : TIMING.LOCATION_NORMAL_INTERVAL_MS;

    this.reportTimer = setInterval(() => {
      if (this.lastPosition) {
        this.sendReport(this.lastPosition);
      }
    }, interval);
  }

  private async sendReport(pos: GeolocationPosition) {
    let battery: number | undefined;
    if ('getBattery' in navigator) {
      try {
        const bat = await (navigator as any).getBattery();
        battery = Math.round(bat.level * 100);
      } catch {}
    }

    const report: LocationReport = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      precision_m: pos.coords.accuracy,
      timestamp: new Date().toISOString(),
      battery,
    };

    if (navigator.onLine) {
      this.onReport?.(report);
    } else {
      // Store locally when offline
      if (this.pendingReports.length < STORAGE_CONFIG.LOCATION_HISTORY_MAX_RECORDS) {
        this.pendingReports.push(report);
      }
    }
  }
}
