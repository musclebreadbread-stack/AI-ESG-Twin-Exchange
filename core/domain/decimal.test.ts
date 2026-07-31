import { describe, it, expect } from 'vitest';
import { exact, present, sumExact } from './decimal';

describe('Exact/Presented decimal types', () => {
  it('present() rounds to specified decimals', () => {
    const v = exact('1.2345');
    expect(present(v, 3)).toBe('1.235'); // ROUND_HALF_UP
    expect(present(v, 2)).toBe('1.23');
    expect(present(v, 1)).toBe('1.2');
    expect(present(v, 0)).toBe('1');
  });

  it('present() handles ROUND_HALF_UP correctly at 0.5 boundary', () => {
    expect(present(exact('0.5'), 0)).toBe('1');
    expect(present(exact('1.005'), 2)).toBe('1.01');
    expect(present(exact('2.675'), 2)).toBe('2.68');
  });

  it('sumExact() returns 0 for empty array', () => {
    expect(sumExact([]).toString()).toBe('0');
  });

  it('sumExact() sums with deterministic ordering', () => {
    const values = [exact('0.1'), exact('0.2'), exact('0.3')];
    const result = sumExact(values);
    expect(result.toString()).toBe('0.6'); // Not 0.6000000000000001
  });

  it('0.1 + 0.2 = exactly 0.3 (no floating-point error)', () => {
    const a = exact('0.1');
    const b = exact('0.2');
    const sum = a.plus(b);
    expect(sum.toString()).toBe('0.3');
  });
});
