import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { extractBearerToken, authenticateRequest, isAuthError } from '../auth';
import { registerTenant, suspendTenant, reactivateTenant } from '../tenant';
import type { Tenant } from '@/types';

// Mock the S3 module
vi.mock('../s3', () => ({
  createTenantBucket: vi.fn().mockResolvedValue(undefined),
}));

describe('auth utilities', () => {
  const mockTenant: Tenant = {
    id: 'auth-test-tenant',
    created_at: '2024-01-01T00:00:00.000Z',
    region: 'us-east-1',
    zone_id: 'use1-az4',
    bucket_name: 'keyvalue-auth-test-tenant--use1-az4--x-s3',
    status: 'active',
  };

  const validToken = 'valid-auth-token-12345';

  beforeEach(() => {
    registerTenant({ ...mockTenant }, validToken);
    reactivateTenant(mockTenant.id); // Ensure tenant is active
  });

  describe('extractBearerToken', () => {
    it('extracts token from valid Authorization header', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: 'Bearer my-token-123' },
      });

      const token = extractBearerToken(request);
      expect(token).toBe('my-token-123');
    });

    it('returns null when Authorization header is missing', () => {
      const request = new NextRequest('http://localhost/test');
      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('returns null for non-Bearer auth schemes', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      });

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('returns null for malformed Authorization header', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: 'Bearer' },
      });

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('handles case-insensitive Bearer prefix', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: 'bearer my-token' },
      });

      const token = extractBearerToken(request);
      expect(token).toBe('my-token');
    });
  });

  describe('authenticateRequest', () => {
    it('returns tenant for valid token', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const result = authenticateRequest(request);
      expect(isAuthError(result)).toBe(false);
      if (!isAuthError(result)) {
        expect(result.tenant.id).toBe('auth-test-tenant');
      }
    });

    it('returns error for missing Authorization header', () => {
      const request = new NextRequest('http://localhost/test');
      const result = authenticateRequest(request);

      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.error.status).toBe(401);
      }
    });

    it('returns error for invalid token', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      const result = authenticateRequest(request);
      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.error.status).toBe(401);
      }
    });

    it('returns error for suspended tenant', () => {
      suspendTenant(mockTenant.id);

      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const result = authenticateRequest(request);
      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.error.status).toBe(403);
      }
    });
  });

  describe('isAuthError', () => {
    it('returns true for error result', () => {
      const request = new NextRequest('http://localhost/test');
      const result = authenticateRequest(request);
      expect(isAuthError(result)).toBe(true);
    });

    it('returns false for success result', () => {
      const request = new NextRequest('http://localhost/test', {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const result = authenticateRequest(request);
      expect(isAuthError(result)).toBe(false);
    });
  });
});
