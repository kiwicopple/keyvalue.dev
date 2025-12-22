import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/auth';
import { getObject, putObject, deleteObject, headObject, PreconditionError } from '@/lib/s3';
import { createMetricsCollector } from '@/lib/logger';
import { hashKeyForLogging } from '@/lib/hash';
import { config } from '@/lib/config';

interface RouteParams {
  params: Promise<{ key: string }>;
}

/**
 * GET /api/v1/kv/{key}
 * Retrieve a value by key
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;
  const authResult = authenticateRequest(request);

  if (isAuthError(authResult)) {
    return authResult.error;
  }

  const { tenant } = authResult;
  const keyHash = hashKeyForLogging(key);
  const metrics = createMetricsCollector(tenant.id, 'GET');

  try {
    const result = await getObject(tenant.bucket_name, key);

    if (!result) {
      metrics.finish(404, keyHash);
      return NextResponse.json(
        { error: 'Key not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 }
      );
    }

    metrics.finish(200, keyHash, result.metadata.content_length);

    return new NextResponse(Buffer.from(result.body), {
      status: 200,
      headers: {
        'Content-Type': result.metadata.content_type,
        'Content-Length': result.metadata.content_length.toString(),
        'ETag': `"${result.metadata.etag}"`,
        ...(result.metadata.created_at && {
          'X-Created-At': result.metadata.created_at,
        }),
      },
    });
  } catch (error) {
    metrics.finish(500, keyHash);
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/kv/{key}
 * Store a value by key
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;
  const authResult = authenticateRequest(request);

  if (isAuthError(authResult)) {
    return authResult.error;
  }

  const { tenant } = authResult;
  const keyHash = hashKeyForLogging(key);
  const metrics = createMetricsCollector(tenant.id, 'PUT');

  // Validate key length
  if (Buffer.byteLength(key, 'utf8') > config.limits.maxKeyLength) {
    metrics.finish(400, keyHash);
    return NextResponse.json(
      { error: 'Key too long', code: 'KEY_TOO_LONG', status: 400 },
      { status: 400 }
    );
  }

  try {
    const body = await request.arrayBuffer();
    const value = Buffer.from(body);

    // Validate object size
    if (value.length > config.limits.maxObjectSize) {
      metrics.finish(413, keyHash, value.length);
      return NextResponse.json(
        { error: 'Object too large', code: 'OBJECT_TOO_LARGE', status: 413 },
        { status: 413 }
      );
    }

    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const ifMatch = request.headers.get('if-match')?.replace(/"/g, '');
    const ifNoneMatch = request.headers.get('if-none-match');

    const result = await putObject(tenant.bucket_name, key, value, contentType, {
      ifMatch,
      ifNoneMatch: ifNoneMatch || undefined,
    });

    if (!result.created && ifNoneMatch === '*') {
      metrics.finish(412, keyHash, value.length);
      return NextResponse.json(
        { error: 'Object already exists', code: 'PRECONDITION_FAILED', status: 412 },
        { status: 412 }
      );
    }

    const status = ifNoneMatch === '*' ? 201 : 200;
    metrics.finish(status, keyHash, value.length);

    return NextResponse.json(
      { success: true, etag: result.etag },
      {
        status,
        headers: {
          'ETag': `"${result.etag}"`,
        },
      }
    );
  } catch (error) {
    if (error instanceof PreconditionError) {
      metrics.finish(412, keyHash);
      return NextResponse.json(
        { error: 'Precondition failed', code: 'PRECONDITION_FAILED', status: 412 },
        { status: 412 }
      );
    }

    metrics.finish(500, keyHash);
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/kv/{key}
 * Delete a value by key
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;
  const authResult = authenticateRequest(request);

  if (isAuthError(authResult)) {
    return authResult.error;
  }

  const { tenant } = authResult;
  const keyHash = hashKeyForLogging(key);
  const metrics = createMetricsCollector(tenant.id, 'DELETE');

  try {
    const deleted = await deleteObject(tenant.bucket_name, key);

    if (!deleted) {
      metrics.finish(404, keyHash);
      return NextResponse.json(
        { error: 'Key not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 }
      );
    }

    metrics.finish(204, keyHash);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    metrics.finish(500, keyHash);
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/v1/kv/{key}
 * Get metadata for a key
 */
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;
  const authResult = authenticateRequest(request);

  if (isAuthError(authResult)) {
    return authResult.error;
  }

  const { tenant } = authResult;
  const keyHash = hashKeyForLogging(key);
  const metrics = createMetricsCollector(tenant.id, 'HEAD');

  try {
    const metadata = await headObject(tenant.bucket_name, key);

    if (!metadata) {
      metrics.finish(404, keyHash);
      return new NextResponse(null, { status: 404 });
    }

    metrics.finish(200, keyHash, metadata.content_length);

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': metadata.content_type,
        'Content-Length': metadata.content_length.toString(),
        'ETag': `"${metadata.etag}"`,
        ...(metadata.created_at && {
          'X-Created-At': metadata.created_at,
        }),
      },
    });
  } catch (error) {
    metrics.finish(500, keyHash);
    console.error('HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
