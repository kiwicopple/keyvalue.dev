import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, logRequestMetrics, createMetricsCollector } from '@/lib/logger';
import type { RequestMetrics } from '@/types';

describe('logger utilities', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger', () => {
    it('logs info messages', () => {
      logger.info('test message', { key: 'value' });
      expect(consoleSpy.log).toHaveBeenCalled();

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.key).toBe('value');
    });

    it('logs error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalled();

      const logOutput = consoleSpy.error.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('error message');
    });

    it('logs warn messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();

      const logOutput = consoleSpy.warn.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('warn');
    });

    it('logs debug messages', () => {
      logger.debug('debug message');
      expect(consoleSpy.log).toHaveBeenCalled();

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('debug');
    });

    it('includes timestamp in logs', () => {
      logger.info('test');
      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('logRequestMetrics', () => {
    it('logs request metrics', () => {
      const metrics: RequestMetrics = {
        tenant_id: 'tenant-123',
        operation: 'GET',
        object_size: 1024,
        latency_ms: 15,
        status_code: 200,
        key_hash: 'abc12345',
      };

      logRequestMetrics(metrics);
      expect(consoleSpy.log).toHaveBeenCalled();

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.message).toBe('request_completed');
      expect(parsed.tenant_id).toBe('tenant-123');
      expect(parsed.operation).toBe('GET');
      expect(parsed.status_code).toBe(200);
    });
  });

  describe('createMetricsCollector', () => {
    it('creates a metrics collector', () => {
      const collector = createMetricsCollector('tenant-123', 'PUT');
      expect(collector).toBeDefined();
      expect(typeof collector.finish).toBe('function');
    });

    it('logs metrics when finished', () => {
      const collector = createMetricsCollector('tenant-123', 'PUT');

      // Small delay to ensure measurable latency
      collector.finish(201, 'keyhash', 512);

      expect(consoleSpy.log).toHaveBeenCalled();
      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.tenant_id).toBe('tenant-123');
      expect(parsed.operation).toBe('PUT');
      expect(parsed.status_code).toBe(201);
      expect(parsed.object_size).toBe(512);
      expect(parsed.latency_ms).toBeGreaterThanOrEqual(0);
    });
  });
});
