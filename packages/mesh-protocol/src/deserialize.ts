import { MESH_CONFIG, MAX_MESH_MESSAGE_TYPE } from '@geoalerta/shared';
import { crc16 } from './crc16';
import type { MeshMessage, ParseResult } from './types';

const MIN_MESSAGE_SIZE = MESH_CONFIG.HEADER_SIZE_BYTES + MESH_CONFIG.CRC_SIZE_BYTES; // 33 bytes

/**
 * Deserializa un buffer binario a un MeshMessage.
 * Valida CRC-16, tamaño mínimo y tipo de mensaje.
 */
export function deserialize(buffer: Uint8Array): ParseResult {
  // Validar tamaño mínimo
  if (buffer.length < MIN_MESSAGE_SIZE) {
    return { success: false, error: 'invalid_size' };
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // Extraer y validar CRC
  const dataWithoutCrc = buffer.slice(0, buffer.length - MESH_CONFIG.CRC_SIZE_BYTES);
  const receivedCrc = view.getUint16(buffer.length - MESH_CONFIG.CRC_SIZE_BYTES, false);
  const calculatedCrc = crc16(dataWithoutCrc);

  if (receivedCrc !== calculatedCrc) {
    return { success: false, error: 'invalid_crc' };
  }

  let offset = 0;

  // Byte 0: type + ttl
  const firstByte = buffer[offset]!;
  const type = (firstByte >> 4) & 0x0f;
  const ttl = firstByte & 0x0f;
  offset += 1;

  // Validar tipo de mensaje
  if (type > MAX_MESH_MESSAGE_TYPE) {
    return { success: false, error: 'invalid_type' };
  }

  // Bytes 1-16: originId
  const originId = buffer.slice(offset, offset + 16);
  offset += 16;

  // Bytes 17-20: timestamp
  const timestamp = view.getUint32(offset, false);
  offset += 4;

  // Bytes 21-24: latitude (int32 scaled by 1e7)
  const latRaw = view.getInt32(offset, false);
  const lat = latRaw / 1e7;
  offset += 4;

  // Bytes 25-28: longitude (int32 scaled by 1e7)
  const lngRaw = view.getInt32(offset, false);
  const lng = lngRaw / 1e7;
  offset += 4;

  // Bytes 29-30: payload length
  const payloadLen = view.getUint16(offset, false);
  offset += 2;

  // Validar que el payload cabe en el buffer
  if (offset + payloadLen + MESH_CONFIG.CRC_SIZE_BYTES > buffer.length) {
    return { success: false, error: 'invalid_size' };
  }

  // Payload
  const payload = buffer.slice(offset, offset + payloadLen);

  const message: MeshMessage = {
    type: type as MeshMessage['type'],
    originId: new Uint8Array(originId),
    ttl,
    timestamp,
    lat,
    lng,
    payload: new Uint8Array(payload),
  };

  return { success: true, message };
}
