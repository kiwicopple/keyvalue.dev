import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBucketName, validateConfig, config } from '../config';

describe('config utilities', () => {
  describe('generateBucketName', () => {
    it('generates correct bucket name format', () => {
      const bucketName = generateBucketName('tenant123', 'use1-az4');
      expect(bucketName).toBe('keyvalue-tenant123--use1-az4--x-s3');
    });

    it('handles different tenant IDs', () => {
      const bucketName = generateBucketName('abc-def', 'usw2-az1');
      expect(bucketName).toBe('keyvalue-abc-def--usw2-az1--x-s3');
    });
  });

  describe('validateConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('does not throw in non-production when env vars are missing', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.AWS_REGION;
      delete process.env.AWS_ZONE_ID;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      expect(() => validateConfig()).not.toThrow();
    });

    it('throws in production when env vars are missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.AWS_REGION;
      delete process.env.AWS_ZONE_ID;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      expect(() => validateConfig()).toThrow('Missing required environment variables');
    });
  });

  describe('config object', () => {
    it('has default limits', () => {
      expect(config.limits.maxObjectSize).toBe(10 * 1024 * 1024);
      expect(config.limits.maxKeyLength).toBe(1024);
    });

    it('has bucket prefix', () => {
      expect(config.bucketPrefix).toBe('keyvalue');
    });

    it('has api version', () => {
      expect(config.api.version).toBe('v1');
    });
  });
});
