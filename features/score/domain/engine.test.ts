import { describe, it, expect } from 'vitest';
import { computeScore, normalizeValue, type ScoringRule } from './engine';
import { exact } from '@/core/domain/decimal';

describe('Score Engine', () => {
  const rules: ScoringRule[] = [
    {
      indicatorCode: 'carbon_intensity',
      frameworkCode: 'GRI',
      axis: 'E',
      weight: exact('0.5'),
      direction: 'lower_better',
      scaleMin: exact('0'),
      scaleMax: exact('100'),
      formula: 'scope1 / revenue',
    },
    {
      indicatorCode: 'renewable_pct',
      frameworkCode: 'TCFD',
      axis: 'E',
      weight: exact('0.5'),
      direction: 'higher_better',
      scaleMin: exact('0'),
      scaleMax: exact('100'),
      formula: 'renewable_kwh / total_kwh * 100',
    },
    {
      indicatorCode: 'safety_rate',
      frameworkCode: 'GRI',
      axis: 'S',
      weight: exact('1'),
      direction: 'lower_better',
      scaleMin: exact('0'),
      scaleMax: exact('10'),
      formula: 'incidents / employees * 1000',
    },
    {
      indicatorCode: 'board_independence',
      frameworkCode: 'KSSB',
      axis: 'G',
      weight: exact('1'),
      direction: 'higher_better',
      scaleMin: exact('0'),
      scaleMax: exact('100'),
      formula: 'independent_directors / total_directors * 100',
    },
  ];

  it('computes scores with all indicators present', () => {
    const bindings = [
      { indicatorCode: 'carbon_intensity', value: exact('30') },
      { indicatorCode: 'renewable_pct', value: exact('60') },
      { indicatorCode: 'safety_rate', value: exact('2') },
      { indicatorCode: 'board_independence', value: exact('75') },
    ];

    const result = computeScore(rules, bindings);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.eScore).toBeGreaterThan(0);
    expect(result.sScore).toBeGreaterThan(0);
    expect(result.gScore).toBe(75);
    expect(result.contributions).toHaveLength(4);
  });

  it('handles absent indicators via re-normalization (not zero)', () => {
    // Only E indicators present, S and G absent
    const bindings = [
      { indicatorCode: 'carbon_intensity', value: exact('30') },
      { indicatorCode: 'renewable_pct', value: exact('60') },
    ];

    const result = computeScore(rules, bindings);

    // S and G should be 0 (no data)
    expect(result.sScore).toBe(0);
    expect(result.gScore).toBe(0);
    // E should still work
    expect(result.eScore).toBeGreaterThan(0);
    // Absent indicators should have absentReason
    const absent = result.contributions.filter((c) => c.absentReason);
    expect(absent).toHaveLength(2);
  });

  it('normalizes lower_better correctly', () => {
    const rule = rules[0]; // carbon_intensity, lower_better, 0-100
    // Value of 30 → (100 - 30) / 100 = 0.7
    const n = normalizeValue(exact('30'), rule);
    expect(n.toFixed(1)).toBe('0.7');
  });

  it('normalizes higher_better correctly', () => {
    const rule = rules[1]; // renewable_pct, higher_better, 0-100
    // Value of 60 → (60 - 0) / 100 = 0.6
    const n = normalizeValue(exact('60'), rule);
    expect(n.toFixed(1)).toBe('0.6');
  });

  it('clamps values outside scale range', () => {
    const rule = rules[0];
    // Value of 150 (beyond max) → lower_better → (100 - 150) / 100 = -0.5 → clamped to 0
    const n = normalizeValue(exact('150'), rule);
    expect(n.toFixed(1)).toBe('0.0');
  });
});
