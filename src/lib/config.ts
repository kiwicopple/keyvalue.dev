/**
 * Configuration management for keyvalue.dev
 */

export const config = {
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    zoneId: process.env.AWS_ZONE_ID || 'use1-az4',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // Limits
  limits: {
    maxObjectSize: 10 * 1024 * 1024, // 10 MB
    maxKeyLength: 1024, // bytes
  },

  // Bucket naming
  bucketPrefix: 'keyvalue',

  // API
  api: {
    version: 'v1',
  },
} as const;

/**
 * Generate bucket name for a tenant
 * Format: keyvalue-<tenant-id>--<az-id>--x-s3
 */
export function generateBucketName(tenantId: string, zoneId: string): string {
  return `${config.bucketPrefix}-${tenantId}--${zoneId}--x-s3`;
}

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  const required = [
    'AWS_REGION',
    'AWS_ZONE_ID',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
