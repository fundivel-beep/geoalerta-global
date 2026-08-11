import { describe, it, expect } from 'vitest';
import { calcularRadioBase, calcularFactorProfundidad, calcularRadioAfectacion, clasificarZonaRiesgo } from './impact-radius';

describe('calcularRadioBase', () => {
  it('M3.0 → 1 km', () => {
    expect(calcularRadioBase(3.0)).toBeCloseTo(1, 1);
  });

  it('M5.0 → 10 km', () => {
    expect(calcularRadioBase(5.0)).toBeCloseTo(10, 0);
  });

  it('M7.0 → 100 km', () => {
    expect(calcularRadioBase(7.0)).toBeCloseTo(100, 0);
  });

  it('M9.0 → 1000 km', () => {
    expect(calcularRadioBase(9.0)).toBeCloseTo(1000, 0);
  });
});

describe('calcularFactorProfundidad', () => {
  it('shallow (5 km) → 1.0 (capped)', () => {
    expect(calcularFactorProfundidad(5)).toBe(1.0);
  });

  it('10 km → 1.0', () => {
    expect(calcularFactorProfundidad(10)).toBe(1.0);
  });

  it('20 km → 0.5', () => {
    expect(calcularFactorProfundidad(20)).toBe(0.5);
  });

  it('50 km → 0.3 (minimum)', () => {
    expect(calcularFactorProfundidad(50)).toBeCloseTo(0.3, 1);
  });

  it('100 km → 0.3 (capped at minimum)', () => {
    expect(calcularFactorProfundidad(100)).toBe(0.3);
  });
});

describe('calcularRadioAfectacion', () => {
  it('M5.0, depth 10km → ~10 km', () => {
    expect(calcularRadioAfectacion(5.0, 10)).toBeCloseTo(10, 0);
  });

  it('M7.0, depth 20km → 50 km', () => {
    const radio = calcularRadioAfectacion(7.0, 20);
    expect(radio).toBeCloseTo(50, 0);
  });

  it('throws for magnitude < 3.0', () => {
    expect(() => calcularRadioAfectacion(2.9, 10)).toThrow();
  });

  it('throws for magnitude > 9.5', () => {
    expect(() => calcularRadioAfectacion(9.6, 10)).toThrow();
  });

  it('throws for depth <= 0', () => {
    expect(() => calcularRadioAfectacion(5.0, 0)).toThrow();
    expect(() => calcularRadioAfectacion(5.0, -1)).toThrow();
  });
});

describe('clasificarZonaRiesgo', () => {
  const radio = 100; // 100 km radio

  it('0 km → roja', () => {
    expect(clasificarZonaRiesgo(0, radio)).toBe('roja');
  });

  it('25 km (25%) → roja', () => {
    expect(clasificarZonaRiesgo(25, radio)).toBe('roja');
  });

  it('50 km (50%) → roja', () => {
    expect(clasificarZonaRiesgo(50, radio)).toBe('roja');
  });

  it('51 km (51%) → naranja', () => {
    expect(clasificarZonaRiesgo(51, radio)).toBe('naranja');
  });

  it('100 km (100%) → naranja', () => {
    expect(clasificarZonaRiesgo(100, radio)).toBe('naranja');
  });

  it('101 km (101%) → amarilla', () => {
    expect(clasificarZonaRiesgo(101, radio)).toBe('amarilla');
  });

  it('150 km (150%) → amarilla', () => {
    expect(clasificarZonaRiesgo(150, radio)).toBe('amarilla');
  });

  it('151 km (151%) → null (fuera de zona)', () => {
    expect(clasificarZonaRiesgo(151, radio)).toBeNull();
  });
});
