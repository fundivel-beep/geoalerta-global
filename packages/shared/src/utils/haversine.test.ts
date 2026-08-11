import { describe, it, expect } from 'vitest';
import { haversine } from './haversine';

describe('haversine', () => {
  it('returns 0 for the same point', () => {
    expect(haversine(0, 0, 0, 0)).toBe(0);
    expect(haversine(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it('calculates distance between New York and Los Angeles (~3936 km)', () => {
    const distance = haversine(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(3960);
  });

  it('calculates distance between Mexico City and Acapulco (~296 km)', () => {
    const distance = haversine(19.4326, -99.1332, 16.8531, -99.8237);
    expect(distance).toBeGreaterThan(290);
    expect(distance).toBeLessThan(310);
  });

  it('calculates distance between Lima and Santiago (~2470 km)', () => {
    const distance = haversine(-12.0464, -77.0428, -33.4489, -70.6693);
    expect(distance).toBeCloseTo(2470, -1);
  });

  it('handles antipodal points (~20000 km)', () => {
    const distance = haversine(0, 0, 0, 180);
    expect(distance).toBeCloseTo(20015, -1);
  });

  it('handles negative coordinates correctly', () => {
    const d1 = haversine(-34.6037, -58.3816, -33.4489, -70.6693); // Buenos Aires - Santiago
    expect(d1).toBeGreaterThan(1000);
    expect(d1).toBeLessThan(1200);
  });
});
