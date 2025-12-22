/**
 * Core types for keyvalue.dev
 */

export type TenantStatus = 'active' | 'suspended';

export interface Tenant {
  id: string;
  created_at: string;
  region: string;
  zone_id: string;
  bucket_name: string;
  status: TenantStatus;
}

export interface TenantToken {
  token: string;
  tenant_id: string;
  created_at: string;
}

export interface KVMetadata {
  etag: string;
  content_type: string;
  content_length: number;
  created_at?: string;
}

export interface RequestMetrics {
  tenant_id: string;
  operation: 'GET' | 'PUT' | 'DELETE' | 'HEAD';
  object_size?: number;
  latency_ms: number;
  status_code: number;
  key_hash: string;
}

export interface ProvisioningResult {
  tenant: Tenant;
  token: TenantToken;
}

export interface ApiError {
  error: string;
  code: string;
  status: number;
}
