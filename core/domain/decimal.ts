/**
 * Core decimal precision types — the single source of truth for numeric handling.
 *
 * - Exact: Internal computation type. All arithmetic uses this.
 * - Presented: Display-only branded string. Cannot be used in arithmetic (compile error).
 * - present(): The ONLY path from Exact → Presented.
 */
import Decimal from 'decimal.js';

// Global precision configuration — set once at module load
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/** Branded type for internal exact decimal values */
export type Exact = Decimal & { readonly __brand: 'Exact' };

/** Branded type for display-only formatted strings — arithmetic is a compile error */
export type Presented = string & { readonly __brand: 'Presented' };

/**
 * Create an Exact value from a Decimal or string.
 * This is the entry point for all numeric values into the system.
 */
export function exact(v: Decimal | string | number): Exact {
  return new Decimal(v) as Exact;
}

/**
 * Sum an array of Exact values with deterministic ordering.
 * Values are sorted before summation to ensure consistent results
 * regardless of input order.
 */
export function sumExact(values: readonly Exact[]): Exact {
  if (values.length === 0) return exact(0);
  const sorted = [...values].sort((a, b) => a.cmp(b));
  return sorted.reduce((acc, v) => acc.plus(v) as Exact, exact(0));
}

/**
 * The ONLY conversion path from Exact → Presented.
 * No reverse conversion exists by design.
 */
export function present(v: Exact, decimals: 3 | 2 | 1 | 0 = 3): Presented {
  return v.toFixed(decimals) as Presented;
}

export { Decimal };
