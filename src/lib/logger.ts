import type { RequestMetrics } from '@/types';

/**
 * Simple structured logger for observability
 * In production, replace with proper logging service (CloudWatch, Datadog, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  const output = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};

/**
 * Log request metrics
 */
export function logRequestMetrics(metrics: RequestMetrics): void {
  logger.info('request_completed', {
    tenant_id: metrics.tenant_id,
    operation: metrics.operation,
    object_size: metrics.object_size,
    latency_ms: metrics.latency_ms,
    status_code: metrics.status_code,
    key_hash: metrics.key_hash,
  });
}

/**
 * Create a metrics collector for a request
 */
export function createMetricsCollector(tenantId: string, operation: RequestMetrics['operation']) {
  const startTime = Date.now();

  return {
    finish(statusCode: number, keyHash: string, objectSize?: number) {
      const latencyMs = Date.now() - startTime;
      logRequestMetrics({
        tenant_id: tenantId,
        operation,
        object_size: objectSize,
        latency_ms: latencyMs,
        status_code: statusCode,
        key_hash: keyHash,
      });
    },
  };
}
