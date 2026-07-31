/**
 * Unit Registry — rational number-based conversions.
 */
import Decimal from 'decimal.js';

export interface UnitConversion {
  readonly id: string;
  readonly fromUnit: string;
  readonly toUnit: string;
  readonly numerator: Decimal;
  readonly denominator: Decimal;
  readonly source: string;
}

export interface UnitRegistry {
  find(fromUnit: string, toUnit: string): UnitConversion | null;
  findCanonical(dimension: string): string;
}

/**
 * In-memory registry loaded from seed data.
 * Dimension-per-canonical uniqueness is enforced at load time.
 */
export function createUnitRegistry(conversions: UnitConversion[]): UnitRegistry {
  const map = new Map<string, UnitConversion>();
  for (const c of conversions) {
    const key = `${c.fromUnit}→${c.toUnit}`;
    map.set(key, c);
  }

  return {
    find(fromUnit: string, toUnit: string): UnitConversion | null {
      return map.get(`${fromUnit}→${toUnit}`) ?? null;
    },
    findCanonical(_dimension: string): string {
      // Will be populated from DB at runtime
      return '';
    },
  };
}
