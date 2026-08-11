import { create } from 'zustand';
import type { EstadoBaliza, ZonaRiesgo, EstadoCheckIn } from '@geoalerta/shared';

interface ActiveAlert {
  eventoId: string;
  magnitud: number;
  etaSeconds: number;
  zonaRiesgo: ZonaRiesgo;
  distanciaKm: number;
  timestamp: string;
}

interface AlertState {
  // Connection
  isConnected: boolean;
  isOnline: boolean;

  // Sensor
  sensorActive: boolean;
  sensorBufferFill: number;
  preAlertActive: boolean;

  // Alerts
  activeAlert: ActiveAlert | null;
  showCheckIn: boolean;
  checkInStatus: EstadoCheckIn | null;

  // Beacon
  beaconState: EstadoBaliza;
  beaconCountdown: number;

  // Mesh
  meshActive: boolean;
  meshPeers: number;
  meshQueueSize: number;

  // Location
  lastLocation: { lat: number; lng: number } | null;
  locationPermission: boolean;

  // Actions
  setConnected: (connected: boolean) => void;
  setOnline: (online: boolean) => void;
  setSensorActive: (active: boolean) => void;
  setSensorBufferFill: (fill: number) => void;
  setPreAlert: (active: boolean) => void;
  setActiveAlert: (alert: ActiveAlert | null) => void;
  setShowCheckIn: (show: boolean) => void;
  setCheckInStatus: (status: EstadoCheckIn | null) => void;
  setBeaconState: (state: EstadoBaliza) => void;
  setBeaconCountdown: (seconds: number) => void;
  setMeshActive: (active: boolean) => void;
  setMeshPeers: (count: number) => void;
  setMeshQueueSize: (size: number) => void;
  setLastLocation: (loc: { lat: number; lng: number } | null) => void;
  setLocationPermission: (granted: boolean) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isConnected: false,
  isOnline: true,
  sensorActive: false,
  sensorBufferFill: 0,
  preAlertActive: false,
  activeAlert: null,
  showCheckIn: false,
  checkInStatus: null,
  beaconState: 'normal',
  beaconCountdown: 0,
  meshActive: false,
  meshPeers: 0,
  meshQueueSize: 0,
  lastLocation: null,
  locationPermission: false,

  setConnected: (connected) => set({ isConnected: connected }),
  setOnline: (online) => set({ isOnline: online }),
  setSensorActive: (active) => set({ sensorActive: active }),
  setSensorBufferFill: (fill) => set({ sensorBufferFill: fill }),
  setPreAlert: (active) => set({ preAlertActive: active }),
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  setShowCheckIn: (show) => set({ showCheckIn: show }),
  setCheckInStatus: (status) => set({ checkInStatus: status }),
  setBeaconState: (state) => set({ beaconState: state }),
  setBeaconCountdown: (seconds) => set({ beaconCountdown: seconds }),
  setMeshActive: (active) => set({ meshActive: active }),
  setMeshPeers: (count) => set({ meshPeers: count }),
  setMeshQueueSize: (size) => set({ meshQueueSize: size }),
  setLastLocation: (loc) => set({ lastLocation: loc }),
  setLocationPermission: (granted) => set({ locationPermission: granted }),
}));
