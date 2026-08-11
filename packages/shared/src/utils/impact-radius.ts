import type { ZonaRiesgo } from '../types';

/**
 * Calcula el radio de afectación base de un sismo.
 * Fórmula: R_base = 10^(0.5 * M - 1.5) km
 */
export function calcularRadioBase(magnitud: number): number {
  return Math.pow(10, 0.5 * magnitud - 1.5);
}

/**
 * Calcula el factor de profundidad.
 * Sismos superficiales (D pequeño) generan mayor afectación.
 * F = max(0.3, min(1.0, 10 / D))
 */
export function calcularFactorProfundidad(profundidad_km: number): number {
  return Math.max(0.3, Math.min(1.0, 10 / profundidad_km));
}

/**
 * Calcula el radio final de afectación considerando magnitud y profundidad.
 * R_final = R_base * F
 */
export function calcularRadioAfectacion(magnitud: number, profundidad_km: number): number {
  if (magnitud < 3.0 || magnitud > 9.5) {
    throw new Error(`Magnitud fuera de rango válido (3.0-9.5): ${magnitud}`);
  }
  if (profundidad_km <= 0) {
    throw new Error(`Profundidad debe ser positiva: ${profundidad_km}`);
  }

  const radioBase = calcularRadioBase(magnitud);
  const factor = calcularFactorProfundidad(profundidad_km);

  return radioBase * factor;
}

/**
 * Clasifica la zona de riesgo según la distancia al epicentro
 * relativa al radio final de afectación.
 *
 * - Roja: distancia ≤ 50% del radio
 * - Naranja: 50% < distancia ≤ 100% del radio
 * - Amarilla: 100% < distancia ≤ 150% del radio
 * - null: fuera de zona de afectación
 */
export function clasificarZonaRiesgo(
  distancia_km: number,
  radio_final_km: number,
): ZonaRiesgo | null {
  const ratio = distancia_km / radio_final_km;

  if (ratio <= 0.5) return 'roja';
  if (ratio <= 1.0) return 'naranja';
  if (ratio <= 1.5) return 'amarilla';
  return null;
}
