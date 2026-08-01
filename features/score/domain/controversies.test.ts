import { describe, it, expect } from 'vitest';
import { assessControversies, applyControversyDeductions, calculateRecencyFactor, type Controversy } from './controversies';
import { exact } from '@/core/domain/decimal';

describe('ESG Controversies Deduction (MSCI methodology)', () => {
  const baseDate = new Date('2024-07-01');

  const controversies: Controversy[] = [
    {
      id: '1', category: 'environment_pollution', severity: 'severe',
      title: '유해물질 유출', description: 'Factory B 유해물질 유출 사고',
      occurredAt: new Date('2024-04-01'), affectedAxis: 'E', verified: true,
    },
    {
      id: '2', category: 'labor_rights', severity: 'moderate',
      title: '노동법 위반', description: '초과근무 수당 미지급',
      occurredAt: new Date('2023-06-01'), affectedAxis: 'S', verified: true,
    },
    {
      id: '3', category: 'corruption_bribery', severity: 'very_severe',
      title: '뇌물 혐의', description: '임원 뇌물수수 기소',
      occurredAt: new Date('2024-01-01'), resolvedAt: new Date('2024-06-01'), affectedAxis: 'G', verified: true,
    },
    {
      id: '4', category: 'data_privacy', severity: 'minor',
      title: '비검증 이벤트', description: '미확인 정보유출 보도',
      occurredAt: new Date('2024-06-01'), affectedAxis: 'S', verified: false, // NOT verified
    },
  ];

  it('only applies verified controversies', () => {
    const result = assessControversies(controversies, baseDate);
    // Controversy #4 is not verified → should be excluded
    expect(result.deductions).toHaveLength(3);
  });

  it('applies severity-based deductions', () => {
    const result = assessControversies(controversies, baseDate);
    // #1: severe=12, within 6 months → full
    const d1 = result.deductions.find((d) => d.controversyId === '1');
    expect(d1!.baseDeduction.toNumber()).toBe(12);
    expect(d1!.recencyFactor.toNumber()).toBe(1); // within 6 months
  });

  it('applies recency decay', () => {
    const result = assessControversies(controversies, baseDate);
    // #2: occurred 13 months ago → between 6-24 months, decayed
    const d2 = result.deductions.find((d) => d.controversyId === '2');
    expect(d2!.recencyFactor.toNumber()).toBeLessThan(1);
    expect(d2!.recencyFactor.toNumber()).toBeGreaterThan(0.5);
  });

  it('halves deduction for resolved controversies', () => {
    const result = assessControversies(controversies, baseDate);
    // #3: very_severe=20, resolved → ×0.5
    const d3 = result.deductions.find((d) => d.controversyId === '3');
    expect(d3!.finalDeduction.toNumber()).toBeLessThanOrEqual(10); // 20 × recency × 0.5
  });

  it('applies deductions to scores correctly', () => {
    const assessment = assessControversies(controversies, baseDate);
    const adjusted = applyControversyDeductions(78, 65, 73, assessment);
    expect(adjusted.eScore).toBeLessThan(78);
    expect(adjusted.sScore).toBeLessThan(65);
    expect(adjusted.gScore).toBeLessThan(73);
    expect(adjusted.totalScore).toBeLessThan(72);
  });

  it('scores never go below 0', () => {
    const extremeControversies: Controversy[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`, category: 'environment_pollution' as const, severity: 'very_severe' as const,
      title: `Severe ${i}`, description: '', occurredAt: new Date('2024-06-01'),
      affectedAxis: 'E' as const, verified: true,
    }));
    const assessment = assessControversies(extremeControversies, baseDate);
    const adjusted = applyControversyDeductions(30, 65, 73, assessment);
    expect(adjusted.eScore).toBeGreaterThanOrEqual(0);
  });

  it('recency factor is 0 for events >5 years old', () => {
    const factor = calculateRecencyFactor(new Date('2018-01-01'), baseDate);
    expect(factor.toNumber()).toBe(0);
  });
});
