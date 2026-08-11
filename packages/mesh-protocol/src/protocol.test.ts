import { describe, it, expect } from 'vitest';
import { serialize } from './serialize';
import { deserialize } from './deserialize';
import { crc16 } from './crc16';
import type { MeshMessage } from './types';
import { MESH_MESSAGE_TYPES } from '@geoalerta/shared';

function makeMessage(overrides?: Partial<MeshMessage>): MeshMessage {
  return {
    type: MESH_MESSAGE_TYPES.SOS,
    originId: new Uint8Array(16).fill(0xab),
    ttl: 10,
    timestamp: 1700000000,
    lat: 19.4326,
    lng: -99.1332,
    payload: new Uint8Array([0x01, 0x02, 0x03]),
    ...overrides,
  };
}

describe('serialize / deserialize (round-trip)', () => {
  it('round-trips a basic SOS message', () => {
    const msg = makeMessage();
    const buffer = serialize(msg);
    const result = deserialize(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message.type).toBe(msg.type);
      expect(result.message.ttl).toBe(msg.ttl);
      expect(result.message.timestamp).toBe(msg.timestamp);
      expect(result.message.lat).toBeCloseTo(msg.lat, 5);
      expect(result.message.lng).toBeCloseTo(msg.lng, 5);
      expect(result.message.payload).toEqual(msg.payload);
      expect(result.message.originId).toEqual(msg.originId);
    }
  });

  it('round-trips all message types', () => {
    for (const [name, type] of Object.entries(MESH_MESSAGE_TYPES)) {
      const msg = makeMessage({ type: type as any });
      const buffer = serialize(msg);
      const result = deserialize(buffer);
      expect(result.success, `Failed for type ${name} (${type})`).toBe(true);
      if (result.success) {
        expect(result.message.type).toBe(type);
      }
    }
  });

  it('round-trips empty payload', () => {
    const msg = makeMessage({ payload: new Uint8Array(0) });
    const buffer = serialize(msg);
    const result = deserialize(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message.payload.length).toBe(0);
    }
  });

  it('round-trips maximum payload (1024 bytes)', () => {
    const payload = new Uint8Array(1024).fill(0xff);
    const msg = makeMessage({ payload });
    const buffer = serialize(msg);
    const result = deserialize(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message.payload.length).toBe(1024);
      expect(result.message.payload[0]).toBe(0xff);
    }
  });

  it('round-trips TTL=0', () => {
    const msg = makeMessage({ ttl: 0 });
    const buffer = serialize(msg);
    const result = deserialize(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message.ttl).toBe(0);
    }
  });

  it('round-trips TTL=15 (max)', () => {
    const msg = makeMessage({ ttl: 15 });
    const buffer = serialize(msg);
    const result = deserialize(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message.ttl).toBe(15);
    }
  });

  it('preserves binary exactness (serialize → deserialize → serialize)', () => {
    const msg = makeMessage();
    const buffer1 = serialize(msg);
    const result = deserialize(buffer1);
    expect(result.success).toBe(true);
    if (result.success) {
      const buffer2 = serialize(result.message);
      expect(buffer2).toEqual(buffer1);
    }
  });
});

describe('serialize validation', () => {
  it('throws for payload > 1024 bytes', () => {
    const msg = makeMessage({ payload: new Uint8Array(1025) });
    expect(() => serialize(msg)).toThrow();
  });

  it('throws for TTL > 15', () => {
    const msg = makeMessage({ ttl: 16 });
    expect(() => serialize(msg)).toThrow();
  });

  it('throws for invalid message type', () => {
    const msg = makeMessage({ type: 0x0f as any });
    expect(() => serialize(msg)).toThrow();
  });
});

describe('deserialize error handling', () => {
  it('rejects buffer smaller than minimum size', () => {
    const result = deserialize(new Uint8Array(10));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('invalid_size');
    }
  });

  it('rejects corrupted CRC', () => {
    const msg = makeMessage();
    const buffer = serialize(msg);
    // Corrupt last byte (CRC)
    buffer[buffer.length - 1] = (buffer[buffer.length - 1]! + 1) % 256;
    const result = deserialize(buffer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('invalid_crc');
    }
  });

  it('rejects invalid message type (> 0xA)', () => {
    const msg = makeMessage();
    const buffer = serialize(msg);
    // Override type nibble to 0xF
    buffer[0] = 0xf0 | (buffer[0]! & 0x0f);
    // Recalculate CRC
    const dataLen = buffer.length - 2;
    const newCrc = crc16(buffer.slice(0, dataLen));
    const view = new DataView(buffer.buffer);
    view.setUint16(dataLen, newCrc, false);

    const result = deserialize(buffer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('invalid_type');
    }
  });
});

describe('crc16', () => {
  it('produces consistent results', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const c1 = crc16(data);
    const c2 = crc16(data);
    expect(c1).toBe(c2);
  });

  it('produces different results for different data', () => {
    const d1 = new Uint8Array([0x01, 0x02, 0x03]);
    const d2 = new Uint8Array([0x01, 0x02, 0x04]);
    expect(crc16(d1)).not.toBe(crc16(d2));
  });

  it('returns a 16-bit value', () => {
    const data = new Uint8Array(100).fill(0xaa);
    const result = crc16(data);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffff);
  });
});
