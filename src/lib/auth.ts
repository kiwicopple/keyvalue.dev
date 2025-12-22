import { NextRequest, NextResponse } from 'next/server';
import { getTenantByToken, validateTenantActive } from './tenant';
import type { Tenant, ApiError } from '@/types';

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate a request and return the tenant
 */
export function authenticateRequest(
  request: NextRequest
): { tenant: Tenant } | { error: NextResponse<ApiError> } {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        {
          error: 'Missing or invalid Authorization header',
          code: 'UNAUTHORIZED',
          status: 401,
        },
        { status: 401 }
      ),
    };
  }

  const tenant = getTenantByToken(token);

  if (!tenant) {
    return {
      error: NextResponse.json(
        {
          error: 'Invalid API token',
          code: 'UNAUTHORIZED',
          status: 401,
        },
        { status: 401 }
      ),
    };
  }

  if (!validateTenantActive(tenant)) {
    return {
      error: NextResponse.json(
        {
          error: 'Tenant account is suspended',
          code: 'FORBIDDEN',
          status: 403,
        },
        { status: 403 }
      ),
    };
  }

  return { tenant };
}

/**
 * Type guard to check if auth result is an error
 */
export function isAuthError(
  result: { tenant: Tenant } | { error: NextResponse<ApiError> }
): result is { error: NextResponse<ApiError> } {
  return 'error' in result;
}
