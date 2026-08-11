import { MESH_CONFIG, MAX_MESH_MESSAGE_TYPE } from '@geoalerta/shared';
import { crc16 } from './crc16';
import type { MeshMessage } from './types';

/**
 * Serializa un MeshMessage a formato binario para transmisión P2P.
 *
 * Estructura:
 * [type:4bits + ttl:4bits][originId:16bytes][timestamp:4bytes][lat:4bytes][lng:4bytes][payloadLen:2bytes][payload:variable][crc:2bytes]
 *
 * Total header: 31 bytes + payload + 2 bytes CRC
 */
export function serialize(msg: MeshMessage): Uint8Array {
  if (msg.type > MAX_MESH_MESSAGE_TYPE) {
    throw new Error(`Tipo de mensaje inválido: ${msg.type}`);
  }
  if (msg.payload.length > MESH_CONFIG.MAX_PAYLOAD_BYTES) {
    throw new Error(`Payload excede máximo de ${MESH_CONFIG.MAX_PAYLOAD_BYTES} bytes`);
  }
  if (msg.ttl < 0 || msg.ttl > 15) {
    throw new Error(`TTL fuera de rango (0-15): ${msg.ttl}`);
  }

  const totalSize =
    MESH_CONFIG.HEADER_SIZE_BYTES + msg.payload.length + MESH_CONFIG.CRC_SIZE_BYTES;
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  let offset = 0;

  // Byte 0: type (4 bits high) + ttl (4 bits low)
  buffer[offset] = ((msg.type & 0x0f) << 4) | (msg.ttl & 0x0f);
  offset += 1;

  // Bytes 1-16: originId (128 bits / 16 bytes)
  buffer.set(msg.originId.slice(0, 16), offset);
  offset += 16;

  // Bytes 17-20: timestamp (uint32, big-endian)
  view.setUint32(offset, msg.timestamp, false);
  offset += 4;

  // Bytes 21-24: latitude (int32, big-endian) — scaled by 1e7
  view.setInt32(offset, Math.round(msg.lat * 1e7), false);
  offset += 4;

  // Bytes 25-28: longitude (int32, big-endian) — scaled by 1e7
  view.setInt32(offset, Math.round(msg.lng * 1e7), false);
  offset += 4;

  // Bytes 29-30: payload length (uint16, big-endian)
  view.setUint16(offset, msg.payload.length, false);
  offset += 2;

  // Bytes 31+: payload
  buffer.set(msg.payload, offset);
  offset += msg.payload.length;

  // CRC-16 over everything before CRC
  const dataForCrc = buffer.slice(0, offset);
  const checksum = crc16(dataForCrc);
  view.setUint16(offset, checksum, false);

  return buffer;
}
