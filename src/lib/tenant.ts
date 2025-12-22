import { generateBucketName, config } from './config';
import { generateToken } from './hash';
import { createTenantBucket } from './s3';
import type { Tenant, TenantToken, ProvisioningResult } from '@/types';
import { nanoid } from 'nanoid';

/**
 * In-memory tenant store (replace with database in production)
 * This is a simple implementation for MVP/development
 */
const tenants = new Map<string, Tenant>();
const tokenToTenant = new Map<string, string>();
const tenantTokens = new Map<string, TenantToken>();

/**
 * Provision a new tenant
 * 1. Generate tenant ID
 * 2. Create S3 bucket
 * 3. Store tenant mapping
 * 4. Generate API token
 */
export async function provisionTenant(
  region?: string,
  zoneId?: string
): Promise<ProvisioningResult> {
  const tenantId = nanoid(12);
  const effectiveRegion = region || config.aws.region;
  const effectiveZoneId = zoneId || config.aws.zoneId;
  const bucketName = generateBucketName(tenantId, effectiveZoneId);

  // Create the S3 bucket
  await createTenantBucket(bucketName, tenantId, effectiveZoneId);

  // Create tenant record
  const tenant: Tenant = {
    id: tenantId,
    created_at: new Date().toISOString(),
    region: effectiveRegion,
    zone_id: effectiveZoneId,
    bucket_name: bucketName,
    status: 'active',
  };

  // Generate API token
  const token = generateToken();
  const tenantToken: TenantToken = {
    token,
    tenant_id: tenantId,
    created_at: new Date().toISOString(),
  };

  // Store mappings
  tenants.set(tenantId, tenant);
  tokenToTenant.set(token, tenantId);
  tenantTokens.set(tenantId, tenantToken);

  return { tenant, token: tenantToken };
}

/**
 * Get tenant by ID
 */
export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.get(tenantId);
}

/**
 * Get tenant by API token
 */
export function getTenantByToken(token: string): Tenant | undefined {
  const tenantId = tokenToTenant.get(token);
  if (!tenantId) return undefined;
  return tenants.get(tenantId);
}

/**
 * Validate that a tenant is active
 */
export function validateTenantActive(tenant: Tenant): boolean {
  return tenant.status === 'active';
}

/**
 * Suspend a tenant
 */
export function suspendTenant(tenantId: string): boolean {
  const tenant = tenants.get(tenantId);
  if (!tenant) return false;
  tenant.status = 'suspended';
  return true;
}

/**
 * Reactivate a tenant
 */
export function reactivateTenant(tenantId: string): boolean {
  const tenant = tenants.get(tenantId);
  if (!tenant) return false;
  tenant.status = 'active';
  return true;
}

/**
 * Register an existing tenant (for testing/seeding)
 */
export function registerTenant(tenant: Tenant, token: string): void {
  tenants.set(tenant.id, tenant);
  tokenToTenant.set(token, tenant.id);
  tenantTokens.set(tenant.id, {
    token,
    tenant_id: tenant.id,
    created_at: tenant.created_at,
  });
}
