import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutBucketTaggingCommand,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { config } from './config';
import { getObjectKey } from './hash';
import type { KVMetadata } from '@/types';

let s3Client: S3Client | null = null;

/**
 * Get or create S3 client (singleton)
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    const clientConfig: S3ClientConfig = {
      region: config.aws.region,
    };

    if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      };
    }

    s3Client = new S3Client(clientConfig);
  }

  return s3Client;
}

/**
 * Create a new S3 Express directory bucket for a tenant
 */
export async function createTenantBucket(
  bucketName: string,
  tenantId: string,
  zoneId: string
): Promise<void> {
  const client = getS3Client();

  // Create the directory bucket
  await client.send(
    new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        Location: {
          Type: 'AvailabilityZone',
          Name: zoneId,
        },
        Bucket: {
          Type: 'Directory',
          DataRedundancy: 'SingleAvailabilityZone',
        },
      },
    })
  );

  // Tag the bucket with tenant info
  await client.send(
    new PutBucketTaggingCommand({
      Bucket: bucketName,
      Tagging: {
        TagSet: [
          { Key: 'tenant_id', Value: tenantId },
          { Key: 'service', Value: 'keyvalue.dev' },
          { Key: 'created_at', Value: new Date().toISOString() },
        ],
      },
    })
  );
}

/**
 * Put a value in the KV store
 */
export async function putObject(
  bucketName: string,
  key: string,
  value: Buffer | Uint8Array | string,
  contentType: string,
  options?: {
    ifMatch?: string;
    ifNoneMatch?: string;
  }
): Promise<{ etag: string; created: boolean }> {
  const client = getS3Client();
  const objectKey = getObjectKey(key);

  // Check preconditions if specified
  if (options?.ifMatch || options?.ifNoneMatch) {
    try {
      const existing = await client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        })
      );

      if (options.ifNoneMatch === '*') {
        // Object exists but client wanted create-only
        return { etag: '', created: false };
      }

      if (options.ifMatch && existing.ETag !== `"${options.ifMatch}"`) {
        // ETag doesn't match
        throw new PreconditionError('ETag mismatch');
      }
    } catch (error: unknown) {
      if (error instanceof PreconditionError) throw error;

      const s3Error = error as { name?: string };
      if (s3Error.name === 'NotFound' && options.ifMatch) {
        throw new PreconditionError('Object not found for If-Match');
      }
      // Object doesn't exist, which is fine for create operations
    }
  }

  const result = await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: value,
      ContentType: contentType,
      Metadata: {
        'created-at': new Date().toISOString(),
      },
    })
  );

  return {
    etag: result.ETag?.replace(/"/g, '') || '',
    created: true,
  };
}

/**
 * Get a value from the KV store
 */
export async function getObject(
  bucketName: string,
  key: string
): Promise<{ body: Uint8Array; metadata: KVMetadata } | null> {
  const client = getS3Client();
  const objectKey = getObjectKey(key);

  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    if (!result.Body) {
      return null;
    }

    const body = await result.Body.transformToByteArray();

    return {
      body,
      metadata: {
        etag: result.ETag?.replace(/"/g, '') || '',
        content_type: result.ContentType || 'application/octet-stream',
        content_length: result.ContentLength || body.length,
        created_at: result.Metadata?.['created-at'],
      },
    };
  } catch (error: unknown) {
    const s3Error = error as { name?: string };
    if (s3Error.name === 'NoSuchKey' || s3Error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a value from the KV store
 */
export async function deleteObject(
  bucketName: string,
  key: string
): Promise<boolean> {
  const client = getS3Client();
  const objectKey = getObjectKey(key);

  try {
    // First check if object exists
    await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    // Delete the object
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    return true;
  } catch (error: unknown) {
    const s3Error = error as { name?: string };
    if (s3Error.name === 'NoSuchKey' || s3Error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Get metadata for a value
 */
export async function headObject(
  bucketName: string,
  key: string
): Promise<KVMetadata | null> {
  const client = getS3Client();
  const objectKey = getObjectKey(key);

  try {
    const result = await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    return {
      etag: result.ETag?.replace(/"/g, '') || '',
      content_type: result.ContentType || 'application/octet-stream',
      content_length: result.ContentLength || 0,
      created_at: result.Metadata?.['created-at'],
    };
  } catch (error: unknown) {
    const s3Error = error as { name?: string };
    if (s3Error.name === 'NoSuchKey' || s3Error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * Custom error for precondition failures
 */
export class PreconditionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreconditionError';
  }
}
