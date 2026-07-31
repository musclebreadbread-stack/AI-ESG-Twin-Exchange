/**
 * Task 25: Observability — structured logging and metrics.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  readonly requestId?: string;
  readonly companyId?: string;
  readonly userId?: string;
  readonly traceId?: string;
}

export function createLogger(module: string) {
  return {
    debug: (msg: string, ctx?: LogContext) => log('debug', module, msg, ctx),
    info: (msg: string, ctx?: LogContext) => log('info', module, msg, ctx),
    warn: (msg: string, ctx?: LogContext) => log('warn', module, msg, ctx),
    error: (msg: string, ctx?: LogContext & { error?: unknown }) => log('error', module, msg, ctx),
  };
}

function log(level: LogLevel, module: string, msg: string, ctx?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    msg,
    ...ctx,
  };
  // Structured JSON logging for production
  if (process.env.ENVIRONMENT === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    console.log(`[${level.toUpperCase()}] ${module}: ${msg}`, ctx ?? '');
  }
}
