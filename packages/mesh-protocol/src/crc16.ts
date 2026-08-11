/**
 * CRC-16/CCITT implementación para validación de integridad de mensajes mesh.
 * Polinomio: 0x1021, Valor inicial: 0xFFFF
 */
export function crc16(data: Uint8Array): number {
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]! << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc;
}
