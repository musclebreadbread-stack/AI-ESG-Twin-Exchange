/**
 * Result type — errors as values, not exceptions.
 */

export type Result<T, E> = Ok<T> | Err<E>;

interface Ok<T> {
  readonly _tag: 'Ok';
  readonly value: T;
}

interface Err<E> {
  readonly _tag: 'Err';
  readonly error: E;
}

export function ok<T>(value: T): Ok<T> {
  return { _tag: 'Ok', value };
}

export function err<E>(error: E): Err<E> {
  return { _tag: 'Err', error };
}

export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r._tag === 'Ok';
}

export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return r._tag === 'Err';
}

export function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return isOk(r) ? ok(fn(r.value)) : r;
}

export function flatMap<T, U, E>(
  r: Result<T, E>,
  fn: (v: T) => Result<U, E>
): Result<U, E> {
  return isOk(r) ? fn(r.value) : r;
}

export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return isOk(r) ? r.value : fallback;
}
