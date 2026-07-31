/**
 * Money value object — BigInt-based minor units with phantom currency type.
 * No floating-point path exists.
 */
import { type Result, ok, err } from './result';

export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Money<C extends CurrencyCode = CurrencyCode> {
  readonly minorUnits: bigint;
  readonly currency: C;
  readonly exponent: number;
}

export type MoneyError = 'CURRENCY_MISMATCH';

export function createMoney<C extends CurrencyCode>(
  minorUnits: bigint,
  currency: C,
  exponent: number = currency === 'KRW' || currency === 'JPY' ? 0 : 2
): Money<C> {
  return { minorUnits, currency, exponent };
}

export function fromDecimalString<C extends CurrencyCode>(
  value: string,
  currency: C,
  exponent?: number
): Money<C> {
  const exp = exponent ?? (currency === 'KRW' || currency === 'JPY' ? 0 : 2);
  const [whole = '0', frac = ''] = value.split('.');
  const paddedFrac = frac.padEnd(exp, '0').slice(0, exp);
  const units = BigInt(whole) * BigInt(10 ** exp) + BigInt(paddedFrac);
  return createMoney(units, currency, exp);
}

export function toPresented(m: Money): string {
  const sign = m.minorUnits < 0n ? '-' : '';
  const abs = m.minorUnits < 0n ? -m.minorUnits : m.minorUnits;
  if (m.exponent === 0) return `${sign}${abs}`;
  const str = abs.toString().padStart(m.exponent + 1, '0');
  const whole = str.slice(0, -m.exponent);
  const frac = str.slice(-m.exponent);
  return `${sign}${whole}.${frac}`;
}

export function add<C extends CurrencyCode>(
  a: Money<C>,
  b: Money<C>
): Result<Money<C>, MoneyError> {
  if (a.currency !== b.currency) return err('CURRENCY_MISMATCH');
  return ok(createMoney(a.minorUnits + b.minorUnits, a.currency, a.exponent));
}

export function subtract<C extends CurrencyCode>(
  a: Money<C>,
  b: Money<C>
): Result<Money<C>, MoneyError> {
  if (a.currency !== b.currency) return err('CURRENCY_MISMATCH');
  return ok(createMoney(a.minorUnits - b.minorUnits, a.currency, a.exponent));
}

export function negate<C extends CurrencyCode>(m: Money<C>): Money<C> {
  return createMoney(-m.minorUnits, m.currency, m.exponent);
}

export function compare<C extends CurrencyCode>(
  a: Money<C>,
  b: Money<C>
): Result<-1 | 0 | 1, MoneyError> {
  if (a.currency !== b.currency) return err('CURRENCY_MISMATCH');
  if (a.minorUnits < b.minorUnits) return ok(-1);
  if (a.minorUnits > b.minorUnits) return ok(1);
  return ok(0);
}

/**
 * Multiply by a rational number (numerator/denominator).
 * Avoids floating-point entirely.
 */
export function multiplyByRatio<C extends CurrencyCode>(
  m: Money<C>,
  numerator: bigint,
  denominator: bigint
): Money<C> {
  const result = (m.minorUnits * numerator) / denominator;
  return createMoney(result, m.currency, m.exponent);
}
