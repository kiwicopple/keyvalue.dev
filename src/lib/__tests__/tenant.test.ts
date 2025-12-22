import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTenant,
  getTenantByToken,
  validateTenantActive,
  suspendTenant,
  reactivateTenant,
  registerTenant,
} from '../tenant';
import type { Tenant } from '@/types';

// Mock the S3 module to avoid AWS calls
vi.mock('../s3', () => ({
  createTenantBucket: vi.fn().mockResolvedValue(undefined),
}));

describe('tenant management', () => {
  const mockTenant: Tenant = {
    id: 'test-tenant-123',
    created_at: '2024-01-01T00:00:00.000Z',
    region: 'us-east-1',
    zone_id: 'use1-az4',
    bucket_name: 'keyvalue-test-tenant-123--use1-az4--x-s3',
    status: 'active',
  };

  const mockToken = 'test-token-abc123';

  beforeEach(() => {
    // Register a test tenant for each test
    registerTenant({ ...mockTenant }, mockToken);
  });

  describe('getTenant', () => {
    it('returns tenant by ID', () => {
      const tenant = getTenant('test-tenant-123');
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe('test-tenant-123');
    });

    it('returns undefined for unknown tenant', () => {
      const tenant = getTenant('unknown-tenant');
      expect(tenant).toBeUndefined();
    });
  });

  describe('getTenantByToken', () => {
    it('returns tenant by token', () => {
      const tenant = getTenantByToken(mockToken);
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe('test-tenant-123');
    });

    it('returns undefined for invalid token', () => {
      const tenant = getTenantByToken('invalid-token');
      expect(tenant).toBeUndefined();
    });
  });

  describe('validateTenantActive', () => {
    it('returns true for active tenant', () => {
      const tenant = getTenant('test-tenant-123');
      expect(tenant).toBeDefined();
      expect(validateTenantActive(tenant!)).toBe(true);
    });

    it('returns false for suspended tenant', () => {
      suspendTenant('test-tenant-123');
      const tenant = getTenant('test-tenant-123');
      expect(tenant).toBeDefined();
      expect(validateTenantActive(tenant!)).toBe(false);
    });
  });

  describe('suspendTenant', () => {
    it('suspends an active tenant', () => {
      const result = suspendTenant('test-tenant-123');
      expect(result).toBe(true);

      const tenant = getTenant('test-tenant-123');
      expect(tenant?.status).toBe('suspended');
    });

    it('returns false for unknown tenant', () => {
      const result = suspendTenant('unknown-tenant');
      expect(result).toBe(false);
    });
  });

  describe('reactivateTenant', () => {
    it('reactivates a suspended tenant', () => {
      suspendTenant('test-tenant-123');
      const result = reactivateTenant('test-tenant-123');
      expect(result).toBe(true);

      const tenant = getTenant('test-tenant-123');
      expect(tenant?.status).toBe('active');
    });

    it('returns false for unknown tenant', () => {
      const result = reactivateTenant('unknown-tenant');
      expect(result).toBe(false);
    });
  });

  describe('registerTenant', () => {
    it('registers a new tenant with token', () => {
      const newTenant: Tenant = {
        id: 'new-tenant-456',
        created_at: '2024-01-02T00:00:00.000Z',
        region: 'us-west-2',
        zone_id: 'usw2-az1',
        bucket_name: 'keyvalue-new-tenant-456--usw2-az1--x-s3',
        status: 'active',
      };
      const newToken = 'new-token-xyz';

      registerTenant(newTenant, newToken);

      expect(getTenant('new-tenant-456')).toEqual(newTenant);
      expect(getTenantByToken(newToken)?.id).toBe('new-tenant-456');
    });
  });
});
