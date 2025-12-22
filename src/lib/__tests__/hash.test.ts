import { describe, it, expect } from 'vitest';
import { getHashPrefix, getObjectKey, generateToken, hashKeyForLogging } from '../hash';

describe('hash utilities', () => {
  describe('getHashPrefix', () => {
    it('returns first 2 characters of SHA-256 hash', () => {
      const prefix = getHashPrefix('test-key');
      expect(prefix).toHaveLength(2);
      expect(prefix).toMatch(/^[0-9a-f]{2}$/);
    });

    it('returns consistent hash for same input', () => {
      const key = 'user:123';
      const prefix1 = getHashPrefix(key);
      const prefix2 = getHashPrefix(key);
      expect(prefix1).toBe(prefix2);
    });

    it('returns different hashes for different inputs', () => {
      const prefix1 = getHashPrefix('key1');
      const prefix2 = getHashPrefix('key2');
      expect(prefix1).not.toBe(prefix2);
    });
  });

  describe('getObjectKey', () => {
    it('formats key with hash prefix', () => {
      const userKey = 'mykey';
      const objectKey = getObjectKey(userKey);
      expect(objectKey).toMatch(/^h\/[0-9a-f]{2}\/mykey$/);
    });

    it('preserves special characters in key', () => {
      const userKey = 'user:123/data';
      const objectKey = getObjectKey(userKey);
      expect(objectKey).toContain('user:123/data');
    });

    it('handles empty string', () => {
      const objectKey = getObjectKey('');
      expect(objectKey).toMatch(/^h\/[0-9a-f]{2}\/$/);
    });
  });

  describe('generateToken', () => {
    it('generates 64 character hex string', () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('generates unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashKeyForLogging', () => {
    it('returns 8 character hex string', () => {
      const hash = hashKeyForLogging('sensitive-key');
      expect(hash).toHaveLength(8);
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('returns consistent hash for same input', () => {
      const key = 'my-secret-key';
      const hash1 = hashKeyForLogging(key);
      const hash2 = hashKeyForLogging(key);
      expect(hash1).toBe(hash2);
    });

    it('returns different hashes for different inputs', () => {
      const hash1 = hashKeyForLogging('key1');
      const hash2 = hashKeyForLogging('key2');
      expect(hash1).not.toBe(hash2);
    });
  });
});
