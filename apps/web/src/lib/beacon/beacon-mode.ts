import { SENSOR_CONFIG, TIMING, BATTERY_CONFIG } from '@geoalerta/shared';
import type { EstadoBaliza } from '@geoalerta/shared';
import { AudioSOS } from './audio-sos';
import { FlashSOS } from './flash-sos';

type BeaconStateChangeCallback = (state: EstadoBaliza) => void;
type BurstSyncCallback = (data: { lat: number; lng: number; battery: number }) => void;

/**
 * Beacon Mode (Modo Baliza) - Survival Signal System
 *
 * State machine: NORMAL → COUNTDOWN → BALIZA_ACTIVA → ULTRA_LOW_POWER
 *
 * Activates automatically when:
 * - Impact >3g detected
 * - Immobility for >5 minutes (<0.1g variation)
 * - Light < 1 lux
 * - No check-in response
 *
 * Signals emitted:
 * - Audio SOS (2000-4000Hz) every 30s
 * - BLE Advertising every 1s
 * - Flash SOS every 60s
 */
export class BeaconMode {
  private state: EstadoBaliza = 'normal';
  private audioSOS = new AudioSOS();
  private flashSOS = new FlashSOS();
  private countdownTimer: NodeJS.Timeout | null = null;
  private audioTimer: NodeJS.Timeout | null = null;
  private flashTimer: NodeJS.Timeout | null = null;
  private batteryCheckTimer: NodeJS.Timeout | null = null;
  private countdownRemaining = TIMING.BEACON_COUNTDOWN_SEC;
  private onStateChange: BeaconStateChangeCallback | null = null;
  private onBurstSync: BurstSyncCallback | null = null;
  private lastKnownLocation: { lat: number; lng: number } | null = null;

  get currentState(): EstadoBaliza {
    return this.state;
  }

  get countdownSeconds(): number {
    return this.countdownRemaining;
  }

  setCallbacks(cbs: {
    onStateChange: BeaconStateChangeCallback;
    onBurstSync: BurstSyncCallback;
  }) {
    this.onStateChange = cbs.onStateChange;
    this.onBurstSync = cbs.onBurstSync;
  }

  setLastLocation(lat: number, lng: number) {
    this.lastKnownLocation = { lat, lng };
  }

  /**
   * Trigger the beacon activation countdown (30 seconds).
   * User can cancel during this period.
   */
  startCountdown() {
    if (this.state !== 'normal') return;

    this.state = 'countdown';
    this.countdownRemaining = TIMING.BEACON_COUNTDOWN_SEC;
    this.onStateChange?.('countdown');

    // Countdown with alarm sound
    this.countdownTimer = setInterval(() => {
      this.countdownRemaining--;

      if (this.countdownRemaining <= 0) {
        clearInterval(this.countdownTimer!);
        this.countdownTimer = null;
        this.activate();
      }
    }, 1000);

    // Vibrate during countdown
    navigator.vibrate?.([200, 100, 200, 100, 200, 100, 200]);
  }

  /**
   * Cancel the countdown (user is responsive)
   */
  cancelCountdown() {
    if (this.state !== 'countdown') return;

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.state = 'normal';
    this.onStateChange?.('normal');
  }

  /**
   * Activate Beacon Mode - start all rescue signals
   */
  activate() {
    this.state = 'baliza_activa';
    this.onStateChange?.('baliza_activa');

    // Disable non-essential modules (screen will be managed by WakeLock release)
    this.startSignals();
    this.startBatteryMonitoring();
  }

  /**
   * Manually deactivate (user long-press 3s)
   */
  deactivate() {
    this.stopAllSignals();
    this.state = 'normal';
    this.onStateChange?.('normal');
  }

  private startSignals() {
    // Audio SOS every 30 seconds
    this.audioSOS.playSOS();
    this.audioTimer = setInterval(() => {
      if (this.state === 'baliza_activa') {
        this.audioSOS.playSOS();
      }
    }, TIMING.BEACON_AUDIO_CYCLE_SEC * 1000);

    // Flash SOS every 60 seconds
    this.flashSOS.playSOS();
    this.flashTimer = setInterval(() => {
      if (this.state === 'baliza_activa') {
        this.flashSOS.playSOS();
      }
    }, TIMING.BEACON_FLASH_CYCLE_SEC * 1000);

    // TODO: BLE Advertising (requires Capacitor native plugin for full support)
  }

  private startBatteryMonitoring() {
    const checkBattery = async () => {
      if (!('getBattery' in navigator)) return;

      const battery = await (navigator as any).getBattery();
      const level = Math.round(battery.level * 100);

      if (level <= BATTERY_CONFIG.BURST_SYNC_THRESHOLD_PERCENT) {
        this.executeBurstSync(level);
      }
    };

    checkBattery();
    this.batteryCheckTimer = setInterval(checkBattery, 60_000); // Check every minute
  }

  private executeBurstSync(batteryLevel: number) {
    if (this.lastKnownLocation) {
      this.onBurstSync?.({
        ...this.lastKnownLocation,
        battery: batteryLevel,
      });
    }

    // Transition to ultra-low power
    this.stopAllSignals();
    this.state = 'ultra_low_power';
    this.onStateChange?.('ultra_low_power');

    // Only keep minimal BLE advertising (every 10s) — requires native
  }

  private stopAllSignals() {
    if (this.audioTimer) clearInterval(this.audioTimer);
    if (this.flashTimer) clearInterval(this.flashTimer);
    if (this.batteryCheckTimer) clearInterval(this.batteryCheckTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.audioSOS.stop();
    this.flashSOS.stop();
    this.audioTimer = null;
    this.flashTimer = null;
    this.batteryCheckTimer = null;
    this.countdownTimer = null;
  }
}
