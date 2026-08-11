import Dexie, { type Table } from 'dexie';

// === Schema Types ===
export interface OfflineLocation {
  id?: number;
  lat: number;
  lng: number;
  precision_m: number;
  timestamp: string;
  battery?: number;
  synced: boolean;
}

export interface OfflineCheckIn {
  id?: number;
  evento_id: string;
  estado: string;
  lat?: number;
  lng?: number;
  es_ubicacion_realtime: boolean;
  nivel_bateria: number;
  timestamp: string;
  synced: boolean;
}

export interface OfflineSOS {
  id?: number;
  lat?: number;
  lng?: number;
  es_ubicacion_realtime: boolean;
  nivel_bateria: number;
  timestamp: string;
  synced: boolean;
}

export interface EmergencyContact {
  id?: number;
  nombre: string;
  telefono: string;
  relacion: string;
}

export interface SeismicProtocol {
  id?: number;
  titulo: string;
  instrucciones: string;
  prioridad: number;
}

export interface NearbyPersonnel {
  id?: number;
  usuario_id: string;
  nombre: string;
  estado: string;
  lat?: number;
  lng?: number;
  ultimo_contacto: string;
  updated_at: string;
}

// === Database ===
class GeoAlertaDB extends Dexie {
  locations!: Table<OfflineLocation>;
  checkIns!: Table<OfflineCheckIn>;
  sosSignals!: Table<OfflineSOS>;
  contacts!: Table<EmergencyContact>;
  protocols!: Table<SeismicProtocol>;
  nearbyPersonnel!: Table<NearbyPersonnel>;

  constructor() {
    super('GeoAlertaDB');

    this.version(1).stores({
      locations: '++id, timestamp, synced',
      checkIns: '++id, evento_id, timestamp, synced',
      sosSignals: '++id, timestamp, synced',
      contacts: '++id, nombre',
      protocols: '++id, prioridad',
      nearbyPersonnel: '++id, usuario_id, updated_at',
    });
  }
}

export const db = new GeoAlertaDB();

// === Helper functions ===

export async function storeOfflineLocation(loc: Omit<OfflineLocation, 'id' | 'synced'>) {
  await db.locations.add({ ...loc, synced: false });
  // Enforce max 500 records
  const count = await db.locations.count();
  if (count > 500) {
    const oldest = await db.locations.orderBy('timestamp').limit(count - 500).toArray();
    await db.locations.bulkDelete(oldest.map((l) => l.id!));
  }
}

export async function getUnsyncedLocations(): Promise<OfflineLocation[]> {
  return db.locations.where('synced').equals(0).toArray();
}

export async function markLocationsSynced(ids: number[]) {
  await db.locations.where('id').anyOf(ids).modify({ synced: true });
}

export async function storeOfflineCheckIn(checkIn: Omit<OfflineCheckIn, 'id' | 'synced'>) {
  await db.checkIns.add({ ...checkIn, synced: false });
}

export async function getUnsyncedCheckIns(): Promise<OfflineCheckIn[]> {
  return db.checkIns.where('synced').equals(0).toArray();
}

export async function storeOfflineSOS(sos: Omit<OfflineSOS, 'id' | 'synced'>) {
  await db.sosSignals.add({ ...sos, synced: false });
}

export async function cleanOldData(maxAgeHours: number = 72) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
  await db.nearbyPersonnel.where('updated_at').below(cutoff).delete();
  await db.locations.where('timestamp').below(cutoff).filter((l) => l.synced).delete();
}
