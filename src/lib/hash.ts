import { createHash } from 'crypto';

/**
 * Generate hash prefix for key layout
 * Returns first 2 characters of SHA-256 hash
 */
export function getHashPrefix(key: string): string {
  const hash = createHash('sha256').update(key).digest('hex');
  return hash.substring(0, 2);
}

/**
 * Generate S3 object key from user key
 * Format: h/<hash-prefix>/<key>
 */
export function getObjectKey(userKey: string): string {
  const prefix = getHashPrefix(userKey);
  return `h/${prefix}/${userKey}`;
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return createHash('sha256')
    .update(crypto.randomUUID())
    .update(Date.now().toString())
    .digest('hex');
}

/**
 * Hash a key for logging (privacy-preserving)
 */
export function hashKeyForLogging(key: string): string {
  return createHash('sha256').update(key).digest('hex').substring(0, 8);
}
