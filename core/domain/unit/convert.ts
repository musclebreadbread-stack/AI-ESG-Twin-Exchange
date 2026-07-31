/**
 * Unit conversion — rational arithmetic only, no floating-point.
 */
import Decimal from 'decimal.js';
import type { Result } from '../result';
import { ok, err } from '../result';
import type { UnitConversion, UnitRegistry } from './registry';
import { type Exact, exact } from '../decimal';

export type UnitError = 'UNIT_NOT_ALLOWED_FOR_ITEM' | 'NO_CONVERSION_PATH';

export interface ConversionResult {
  readonly value: Exact;
  readonly conversionId: string;
  readonly factorNumerator: Decimal;
  readonly factorDenominator: Decimal;
}

export interface ActivityItemDef {
  readonly code: string;
  readonly canonicalUnit: string;
  readonly allowedUnits: readonly string[];
}

export function toCanonical(
  value: Exact,
  fromUnit: string,
  itemDef: ActivityItemDef,
  registry: UnitRegistry
): Result<ConversionResult, UnitError> {
  // Check if unit is allowed for this item
  if (!itemDef.allowedUnits.includes(fromUnit)) {
    return err('UNIT_NOT_ALLOWED_FOR_ITEM');
  }

  // Same unit — identity conversion
  if (fromUnit === itemDef.canonicalUnit) {
    return ok({
      value,
      conversionId: 'identity',
      factorNumerator: new Decimal(1),
      factorDenominator: new Decimal(1),
    });
  }

  // Lookup conversion
  const conversion = registry.find(fromUnit, itemDef.canonicalUnit);
  if (!conversion) {
    return err('NO_CONVERSION_PATH');
  }

  // Rational arithmetic: value * numerator / denominator
  const converted = value.times(conversion.numerator).dividedBy(conversion.denominator);

  return ok({
    value: exact(converted),
    conversionId: conversion.id,
    factorNumerator: conversion.numerator,
    factorDenominator: conversion.denominator,
  });
}
