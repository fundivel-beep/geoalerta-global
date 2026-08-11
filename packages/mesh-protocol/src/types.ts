import { MESH_MESSAGE_TYPES } from '@geoalerta/shared';

export type MeshMessageType = (typeof MESH_MESSAGE_TYPES)[keyof typeof MESH_MESSAGE_TYPES];

export interface MeshMessage {
  type: MeshMessageType;
  originId: Uint8Array;  // 16 bytes (128 bits)
  ttl: number;           // 0-15 (4 bits)
  timestamp: number;     // Unix seconds (32 bits)
  lat: number;           // Latitude encoded as int32
  lng: number;           // Longitude encoded as int32
  payload: Uint8Array;   // Variable, max 1024 bytes
}

export type ParseResult =
  | { success: true; message: MeshMessage }
  | { success: false; error: 'invalid_size' | 'invalid_crc' | 'invalid_type' };
