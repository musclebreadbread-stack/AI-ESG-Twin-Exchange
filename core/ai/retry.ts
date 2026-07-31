/**
 * Task 16.6/16.10: Unified AI Retry Matrix.
 *
 * Contract:
 * - Primary: initial call + 2 retryable retries at 1s/2s (timeout/5xx/rate-limit)
 * - Alternate: exactly once after primary's 3 failed attempts
 * - No transport retry for 4xx/schema/capability errors
 * - Schema repair: 1 attempt, counted in provider budget
 * - Entire flow bounded by deadline/cost cap
 * - Circuit opens after primary's 3 failed attempts
 */

export interface RetryConfig {
  readonly primaryRetries: number;
  readonly retryDelaysMs: readonly number[];
  readonly alternateAttempts: number;
  readonly schemaRepairAttempts: number;
  readonly deadlineMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  primaryRetries: 2,
  retryDelaysMs: [1000, 2000],
  alternateAttempts: 1,
  schemaRepairAttempts: 1,
  deadlineMs: 30_000,
} as const;

export type RetryableError = 'TIMEOUT' | 'SERVER_ERROR' | 'RATE_LIMITED';
export type NonRetryableError = 'CLIENT_ERROR' | 'SCHEMA_ERROR' | 'CAPABILITY_ERROR';

export function isRetryableAiError(errorType: string): boolean {
  const retryable: readonly string[] = ['TIMEOUT', 'SERVER_ERROR', 'RATE_LIMITED'];
  return retryable.includes(errorType);
}

export function isNonRetryableAiError(errorType: string): boolean {
  const nonRetryable: readonly string[] = ['CLIENT_ERROR', 'SCHEMA_ERROR', 'CAPABILITY_ERROR'];
  return nonRetryable.includes(errorType);
}

export interface RetryState {
  readonly provider: 'primary' | 'alternate';
  readonly attempt: number;
  readonly totalElapsedMs: number;
  readonly circuitOpen: boolean;
  readonly schemaRepairUsed: boolean;
}

/**
 * Determine next action based on current state and error.
 */
export function nextRetryAction(
  state: RetryState,
  errorType: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): 'retry_primary' | 'switch_alternate' | 'schema_repair' | 'fail' {
  // Non-retryable → fail immediately (except schema which gets 1 repair)
  if (errorType === 'SCHEMA_ERROR' && !state.schemaRepairUsed) {
    return 'schema_repair';
  }
  if (isNonRetryableAiError(errorType)) {
    return 'fail';
  }

  // Deadline exceeded
  if (state.totalElapsedMs >= config.deadlineMs) {
    return 'fail';
  }

  // Primary retries exhausted → switch to alternate
  if (state.provider === 'primary' && state.attempt >= config.primaryRetries + 1) {
    return 'switch_alternate';
  }

  // Primary still has budget → retry
  if (state.provider === 'primary' && state.attempt < config.primaryRetries + 1) {
    return 'retry_primary';
  }

  // Alternate exhausted → fail
  if (state.provider === 'alternate' && state.attempt >= config.alternateAttempts) {
    return 'fail';
  }

  return 'fail';
}
