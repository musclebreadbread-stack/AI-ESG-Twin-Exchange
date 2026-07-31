import { describe, it, expect } from 'vitest';
import { nextRetryAction, isRetryableAiError, isNonRetryableAiError, type RetryState } from './retry';

describe('AI Retry Matrix', () => {
  const baseState: RetryState = {
    provider: 'primary',
    attempt: 1,
    totalElapsedMs: 0,
    circuitOpen: false,
    schemaRepairUsed: false,
  };

  it('retries primary on timeout (attempt 1 of 3)', () => {
    const action = nextRetryAction(baseState, 'TIMEOUT');
    expect(action).toBe('retry_primary');
  });

  it('retries primary on 5xx (attempt 2 of 3)', () => {
    const action = nextRetryAction({ ...baseState, attempt: 2 }, 'SERVER_ERROR');
    expect(action).toBe('retry_primary');
  });

  it('switches to alternate after primary exhausted (attempt 3)', () => {
    const action = nextRetryAction({ ...baseState, attempt: 3 }, 'TIMEOUT');
    expect(action).toBe('switch_alternate');
  });

  it('fails immediately on 4xx client error', () => {
    const action = nextRetryAction(baseState, 'CLIENT_ERROR');
    expect(action).toBe('fail');
  });

  it('allows one schema repair attempt', () => {
    const action = nextRetryAction(baseState, 'SCHEMA_ERROR');
    expect(action).toBe('schema_repair');
  });

  it('fails on second schema error after repair used', () => {
    const action = nextRetryAction({ ...baseState, schemaRepairUsed: true }, 'SCHEMA_ERROR');
    expect(action).toBe('fail');
  });

  it('fails when deadline exceeded', () => {
    const action = nextRetryAction({ ...baseState, totalElapsedMs: 31_000 }, 'TIMEOUT');
    expect(action).toBe('fail');
  });

  it('fails after alternate exhausted', () => {
    const state: RetryState = { ...baseState, provider: 'alternate', attempt: 1 };
    const action = nextRetryAction(state, 'SERVER_ERROR');
    expect(action).toBe('fail');
  });

  it('classifies retryable errors correctly', () => {
    expect(isRetryableAiError('TIMEOUT')).toBe(true);
    expect(isRetryableAiError('SERVER_ERROR')).toBe(true);
    expect(isRetryableAiError('RATE_LIMITED')).toBe(true);
    expect(isRetryableAiError('CLIENT_ERROR')).toBe(false);
  });

  it('classifies non-retryable errors correctly', () => {
    expect(isNonRetryableAiError('CLIENT_ERROR')).toBe(true);
    expect(isNonRetryableAiError('SCHEMA_ERROR')).toBe(true);
    expect(isNonRetryableAiError('CAPABILITY_ERROR')).toBe(true);
    expect(isNonRetryableAiError('TIMEOUT')).toBe(false);
  });
});
