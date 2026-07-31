import { describe, it, expect } from 'vitest';
import { calculateEmission, aggregateEmissions } from './calculate';
import { exact } from '@/core/domain/decimal';
import { isOk, isErr } from '@/core/domain/result';

describe('Emission Calculation Engine', () => {
  const baseInput = {
    activityDataId: 'test-001',
    canonicalValue: exact('1000'), // 1000 kWh
    canonicalUnit: 'kWh',
    factorValue: exact('0.000459'), // tCO2/kWh (Korea grid 2023)
    factorUnit: 'tCO2/kWh',
    gasCode: 'CO2',
    gwpValue: exact('1'), // CO2 GWP = 1
    unitConversionFactor: exact('1'),
  };

  it('calculates tCO2e correctly for simple case', () => {
    const result = calculateEmission(baseInput);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;

    // 1000 × 0.000459 × 1 = 0.459 tCO2e
    expect(result.value.totalTco2e.toFixed(6)).toBe('0.459000');
    expect(result.value.biogenicCo2T.toFixed(6)).toBe('0.000000');
    expect(result.value.gasAmounts).toHaveLength(1);
    expect(result.value.fingerprint).toHaveLength(64);
  });

  it('applies NCV when provided', () => {
    const input = {
      ...baseInput,
      canonicalValue: exact('100'), // 100 kg fuel
      netCalorificValue: exact('0.0418'), // TJ/Gg → simplified for test
      factorValue: exact('74.1'), // tCO2/TJ
    };
    const result = calculateEmission(input);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    // 100 × 0.0418 × 74.1 × 1 = 309.738
    expect(result.value.totalTco2e.toFixed(3)).toBe('309.738');
  });

  it('rejects zero factor value', () => {
    const result = calculateEmission({ ...baseInput, factorValue: exact('0') });
    expect(isErr(result)).toBe(true);
    if (!isErr(result)) return;
    expect(result.error).toBe('INVALID_FACTOR');
  });

  it('rejects negative GWP', () => {
    const result = calculateEmission({ ...baseInput, gwpValue: exact('-1') });
    expect(isErr(result)).toBe(true);
    if (!isErr(result)) return;
    expect(result.error).toBe('INVALID_GWP');
  });

  it('marks biogenic CO2 separately', () => {
    const input = { ...baseInput, gasCode: 'CO2_biogenic' };
    const result = calculateEmission(input);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.value.totalTco2e.toFixed(6)).toBe('0.000000');
    expect(result.value.biogenicCo2T.toFixed(6)).toBe('0.459000');
  });

  it('aggregates multiple results correctly', () => {
    const r1 = calculateEmission(baseInput);
    const r2 = calculateEmission({ ...baseInput, activityDataId: 'test-002', gasCode: 'CH4', gwpValue: exact('28') });
    expect(isOk(r1) && isOk(r2)).toBe(true);
    if (!isOk(r1) || !isOk(r2)) return;

    const agg = aggregateEmissions([r1.value, r2.value]);
    // r1: 0.459, r2: 1000 × 0.000459 × 28 = 12.852
    expect(agg.totalTco2e.toFixed(3)).toBe('13.311');
  });

  it('produces deterministic fingerprints', () => {
    const r1 = calculateEmission(baseInput);
    const r2 = calculateEmission(baseInput);
    expect(isOk(r1) && isOk(r2)).toBe(true);
    if (!isOk(r1) || !isOk(r2)) return;
    expect(r1.value.fingerprint).toBe(r2.value.fingerprint);
  });
});
