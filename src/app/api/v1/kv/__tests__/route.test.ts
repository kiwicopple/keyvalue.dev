import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE, HEAD } from '../[key]/route';
import { registerTenant } from '@/lib/tenant';
import type { Tenant } from '@/types';

// Mock S3 operations
const mockGetObject = vi.fn();
const mockPutObject = vi.fn();
const mockDeleteObject = vi.fn();
const mockHeadObject = vi.fn();

vi.mock('@/lib/s3', () => ({
  getObject: (...args: unknown[]) => mockGetObject(...args),
  putObject: (...args: unknown[]) => mockPutObject(...args),
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
  headObject: (...args: unknown[]) => mockHeadObject(...args),
  createTenantBucket: vi.fn().mockResolvedValue(undefined),
  PreconditionError: class PreconditionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PreconditionError';
    }
  },
}));

describe('KV API Routes', () => {
  const mockTenant: Tenant = {
    id: 'api-test-tenant',
    created_at: '2024-01-01T00:00:00.000Z',
    region: 'us-east-1',
    zone_id: 'use1-az4',
    bucket_name: 'keyvalue-api-test-tenant--use1-az4--x-s3',
    status: 'active',
  };

  const validToken = 'api-test-token-xyz';

  beforeEach(() => {
    vi.clearAllMocks();
    registerTenant({ ...mockTenant }, validToken);
  });

  const createRequest = (
    method: string,
    key: string,
    options: { headers?: Record<string, string>; body?: string } = {}
  ) => {
    const url = `http://localhost/api/v1/kv/${key}`;
    return new NextRequest(url, {
      method,
      headers: {
        Authorization: `Bearer ${validToken}`,
        ...options.headers,
      },
      body: options.body,
    });
  };

  const createParams = (key: string) => ({
    params: Promise.resolve({ key }),
  });

  describe('GET /kv/{key}', () => {
    it('returns value when key exists', async () => {
      mockGetObject.mockResolvedValue({
        body: new Uint8Array(Buffer.from('{"hello":"world"}')),
        metadata: {
          etag: 'abc123',
          content_type: 'application/json',
          content_length: 17,
        },
      });

      const request = createRequest('GET', 'testkey');
      const response = await GET(request, createParams('testkey'));

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('ETag')).toBe('"abc123"');
    });

    it('returns 404 when key does not exist', async () => {
      mockGetObject.mockResolvedValue(null);

      const request = createRequest('GET', 'nonexistent');
      const response = await GET(request, createParams('nonexistent'));

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('returns 401 without authorization', async () => {
      const request = new NextRequest('http://localhost/api/v1/kv/test', {
        method: 'GET',
      });

      const response = await GET(request, createParams('test'));
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /kv/{key}', () => {
    it('stores a value and returns 200', async () => {
      mockPutObject.mockResolvedValue({ etag: 'newtag', created: true });

      const request = createRequest('PUT', 'newkey', {
        headers: { 'Content-Type': 'application/json' },
        body: '{"data":"test"}',
      });

      const response = await PUT(request, createParams('newkey'));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.etag).toBe('newtag');
    });

    it('returns 201 for create-only with If-None-Match: *', async () => {
      mockPutObject.mockResolvedValue({ etag: 'newtag', created: true });

      const request = createRequest('PUT', 'brandnew', {
        headers: {
          'Content-Type': 'text/plain',
          'If-None-Match': '*',
        },
        body: 'hello',
      });

      const response = await PUT(request, createParams('brandnew'));
      expect(response.status).toBe(201);
    });

    it('returns 412 when object exists with If-None-Match: *', async () => {
      mockPutObject.mockResolvedValue({ etag: '', created: false });

      const request = createRequest('PUT', 'existing', {
        headers: {
          'Content-Type': 'text/plain',
          'If-None-Match': '*',
        },
        body: 'hello',
      });

      const response = await PUT(request, createParams('existing'));
      expect(response.status).toBe(412);
    });

    it('returns 401 without authorization', async () => {
      const request = new NextRequest('http://localhost/api/v1/kv/test', {
        method: 'PUT',
        body: 'data',
      });

      const response = await PUT(request, createParams('test'));
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /kv/{key}', () => {
    it('returns 204 when key is deleted', async () => {
      mockDeleteObject.mockResolvedValue(true);

      const request = createRequest('DELETE', 'toDelete');
      const response = await DELETE(request, createParams('toDelete'));

      expect(response.status).toBe(204);
    });

    it('returns 404 when key does not exist', async () => {
      mockDeleteObject.mockResolvedValue(false);

      const request = createRequest('DELETE', 'nonexistent');
      const response = await DELETE(request, createParams('nonexistent'));

      expect(response.status).toBe(404);
    });

    it('returns 401 without authorization', async () => {
      const request = new NextRequest('http://localhost/api/v1/kv/test', {
        method: 'DELETE',
      });

      const response = await DELETE(request, createParams('test'));
      expect(response.status).toBe(401);
    });
  });

  describe('HEAD /kv/{key}', () => {
    it('returns metadata when key exists', async () => {
      mockHeadObject.mockResolvedValue({
        etag: 'headetag',
        content_type: 'application/json',
        content_length: 100,
        created_at: '2024-01-01T00:00:00.000Z',
      });

      const request = createRequest('HEAD', 'metakey');
      const response = await HEAD(request, createParams('metakey'));

      expect(response.status).toBe(200);
      expect(response.headers.get('ETag')).toBe('"headetag"');
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Length')).toBe('100');
    });

    it('returns 404 when key does not exist', async () => {
      mockHeadObject.mockResolvedValue(null);

      const request = createRequest('HEAD', 'nonexistent');
      const response = await HEAD(request, createParams('nonexistent'));

      expect(response.status).toBe(404);
    });

    it('returns 401 without authorization', async () => {
      const request = new NextRequest('http://localhost/api/v1/kv/test', {
        method: 'HEAD',
      });

      const response = await HEAD(request, createParams('test'));
      expect(response.status).toBe(401);
    });
  });
});
