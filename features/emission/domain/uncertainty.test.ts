import { describe, it, expect } from 'vitest';
import { calculateUncertaintyPropagation, calculateUncertaintyMonteCarlo, type UncertaintySource } from './uncertainty';
import { exact } from '@/core/domain/decimal';

describe('Uncertainty Quantification (ISO 14064-1 §6.2.3)', () => {
  const sources: UncertaintySource[] = [
    { parameterName: 'activity_data', nominalValue: exact('1000'), uncertaintyPct: exact('5'), distributionType: 'normal', confidenceLevel: 95 },
    { parameterName: 'emission_factor', nominalValue: exact('0.459'), uncertaintyPct: exact('10'), distributionType: 'normal', confidenceLevel: 95 },
    { parameterName: 'gwp', nominalValue: exact('1'), uncertaintyPct: exact('2'), distributionType: 'normal', confidenceLevel: 95 },
  ];

  const nominalEmission = exact('459'); // 1000 × 0.459 × 1

  describe('Error Propagation (Tier 1)', () => {
    it('calculates combined uncertainty for multiplicative model', () => {
      const result = calculateUncertaintyPropagation(sources, nominalEmission);
      // sqrt(5² + 10² + 2²) = sqrt(25 + 100 + 4) = sqrt(129) ≈ 11.36%
      expect(result.combinedUncertaintyPct.toNumber()).toBeCloseTo(11.36, 1);
      expect(result.method).toBe('error_propagation');
      expect(result.confidenceLevel).toBe(95);
    });

    it('lower bound is never negative', () => {
      const result = calculateUncertaintyPropagation(sources, nominalEmission);
      expect(result.lowerBound.greaterThanOrEqualTo(0)).toBe(true);
    });

    it('identifies largest uncertainty contributor', () => {
      const result = calculateUncertaintyPropagation(sources, nominalEmission);
      const ef = result.componentBreakdown.find((c) => c.parameterName === 'emission_factor');
      // EF contributes 100/129 = 77.5% of total uncertainty
      expect(ef!.contributionPct.toNumber()).toBeCloseTo(77.5, 0);
    });

    it('handles empty sources', () => {
      const result = calculateUncertaintyPropagation([], nominalEmission);
      expect(result.combinedUncertaintyPct.toNumber()).toBe(0);
      expect(result.lowerBound.eq(nominalEmission)).toBe(true);
    });
  });

  describe('Monte Carlo (Tier 2)', () => {
    it('produces results within expected range', () => {
      const result = calculateUncertaintyMonteCarlo(sources, nominalEmission, 5000);
      expect(result.method).toBe('monte_carlo');
      // MC should be roughly similar to propagation method
      expect(result.combinedUncertaintyPct.toNumber()).toBeGreaterThan(5);
      expect(result.combinedUncertaintyPct.toNumber()).toBeLessThan(20);
    });

    it('is deterministic with same seed', () => {
      const r1 = calculateUncertaintyMonteCarlo(sources, nominalEmission, 1000, 42);
      const r2 = calculateUncertaintyMonteCarlo(sources, nominalEmission, 1000, 42);
      expect(r1.combinedUncertaintyPct.eq(r2.combinedUncertaintyPct)).toBe(true);
    });

    it('bounds contain nominal value', () => {
      const result = calculateUncertaintyMonteCarlo(sources, nominalEmission, 5000);
      expect(result.lowerBound.lessThanOrEqualTo(nominalEmission)).toBe(true);
      expect(result.upperBound.greaterThanOrEqualTo(nominalEmission)).toBe(true);
    });
  });
});
