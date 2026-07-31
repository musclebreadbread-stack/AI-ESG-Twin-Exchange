/**
 * Job Queue Port — the interface boundary for job enqueue/status operations.
 * Task 5.1: Defines the contract that the repository layer implements.
 */
import { z } from 'zod';

export type JobPool = 'default' | 'heavy' | 'ai';

export interface JobSpec {
  readonly type: string;
  readonly companyId?: string;
  readonly payload: unknown;
  readonly priority?: number;
  readonly pool?: JobPool;
  readonly idempotencyKey?: string;
  readonly lockKey?: string;
  readonly dedupeKey?: string;
  readonly runAfter?: Date;
  readonly maxAttempts?: number;
  readonly timeoutMs?: number;
}

export type EnqueueResult = 'created' | 'merged' | 'deduplicated';

export interface JobRunContext {
  readonly jobId: string;
  readonly attempt: number;
  readonly signal: AbortSignal;
  checkpoint(progress: number, label?: string): Promise<void>;
}

export interface JobHandler<P = unknown> {
  readonly type: string;
  readonly payloadSchema: z.ZodType<P>;
  readonly timeoutMs: number;
  readonly partialResultPolicy: 'preserve' | 'discard';
  run(payload: P, ctx: JobRunContext): Promise<unknown>;
}

/**
 * Job queue port — all enqueue calls require a transaction client
 * to guarantee atomic domain-write + job-enqueue (dual-write elimination).
 */
export interface JobQueuePort {
  enqueue(spec: JobSpec): Promise<{ jobId: string; outcome: EnqueueResult }>;
  get(jobId: string): Promise<JobStatus | null>;
  requestCancel(jobId: string): Promise<boolean>;
}

export interface JobStatus {
  readonly id: string;
  readonly type: string;
  readonly status: string;
  readonly progress: number;
  readonly progressLabel?: string;
  readonly result?: unknown;
  readonly errorCode?: string;
  readonly createdAt: Date;
  readonly startedAt?: Date;
  readonly finishedAt?: Date;
}

/** Timeout constants by job type (ms) */
export const JOB_TIMEOUT_MS: Record<string, number> = {
  twin_build: 300_000,
  twin_refresh: 300_000,
  report_generate: 180_000,
  scenario_simulate: 300_000,
  activity_import: 300_000,
  score_compute: 120_000,
  agent_recommend: 600_000,
  matching_run: 60_000,
  benchmark_snapshot: 120_000,
  factor_ingest: 300_000,
} as const;
