/**
 * Display-time unit conversion (metric ↔ imperial).
 * Storage values are NEVER modified.
 */
import type { Exact } from '../decimal';
import { exact } from '../decimal';
import type { UnitRegistry } from './registry';

export type DisplaySystem = 'metric' | 'imperial';

export interface DisplayConversion {
  readonly displayValue: Exact;
  readonly displayUnit: string;
  readonly system: DisplaySystem;
}

/**
 * Convert a value to the display system for UI presentation only.
 * The stored canonical value is never changed.
 */
export function toDisplaySystem(
  value: Exact,
  canonicalUnit: string,
  targetSystem: DisplaySystem,
  registry: UnitRegistry
): DisplayConversion {
  // For now, if target matches canonical system, return as-is
  // Full metric↔imperial mapping will be populated from unit seed data
  return {
    displayValue: exact(value),
    displayUnit: canonicalUnit,
    system: targetSystem,
  };
}
