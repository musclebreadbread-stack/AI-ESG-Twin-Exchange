import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, map, flatMap, unwrapOr } from './result';

describe('Result type', () => {
  it('ok() creates a successful result', () => {
    const r = ok(42);
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
  });

  it('err() creates a failed result', () => {
    const r = err('FAIL');
    expect(isErr(r)).toBe(true);
    expect(isOk(r)).toBe(false);
  });

  it('map() transforms Ok values', () => {
    const r = map(ok(2), (x) => x * 3);
    expect(isOk(r) && r.value).toBe(6);
  });

  it('map() passes through Err', () => {
    const r = map(err('X'), (x: number) => x * 3);
    expect(isErr(r) && r.error).toBe('X');
  });

  it('flatMap() chains results', () => {
    const divide = (a: number, b: number) =>
      b === 0 ? err('DIVISION_BY_ZERO' as const) : ok(a / b);
    const r = flatMap(ok(10), (x) => divide(x, 2));
    expect(isOk(r) && r.value).toBe(5);
  });

  it('unwrapOr() provides fallback for Err', () => {
    expect(unwrapOr(err('X'), 99)).toBe(99);
    expect(unwrapOr(ok(42), 99)).toBe(42);
  });
});
