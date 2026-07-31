/**
 * Error taxonomy — categorized error codes for the entire system.
 */

export type ErrorCategory =
  | 'VALIDATION'
  | 'AUTHORIZATION'
  | 'PRECONDITION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RETRYABLE'
  | 'UPSTREAM'
  | 'INTERNAL';

export interface AppError {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number;
  readonly fields?: readonly string[] | undefined;
}

/**
 * The single source of retry-eligibility truth.
 * Only RETRYABLE and UPSTREAM (5xx, network, transient DB) return true.
 * VALIDATION / AUTHORIZATION / PRECONDITION are NEVER retryable.
 */
export function isRetryable(error: AppError): boolean {
  return error.category === 'RETRYABLE' || error.category === 'UPSTREAM';
}

/** HTTP status mapping by category */
export function httpStatusForCategory(category: ErrorCategory): number {
  switch (category) {
    case 'VALIDATION':
      return 400;
    case 'AUTHORIZATION':
      return 403;
    case 'PRECONDITION':
      return 412;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'RETRYABLE':
      return 503;
    case 'UPSTREAM':
      return 502;
    case 'INTERNAL':
      return 500;
  }
}

/** Factory for creating typed errors */
export function createError(
  category: ErrorCategory,
  code: string,
  message: string,
  fields?: readonly string[]
): AppError {
  return {
    category,
    code,
    message,
    httpStatus: httpStatusForCategory(category),
    fields,
  };
}
