/**
 * Key-Value entry with metadata
 */
export interface KVEntry {
  key: string
  value: string
  createdAt: number
  updatedAt: number
}

/**
 * Storage strategy interface
 * Implementations can use localStorage, S3, or any other storage backend
 */
export interface StorageStrategy {
  /**
   * Get all key-value entries
   */
  getAll(): Promise<KVEntry[]>

  /**
   * Get a single entry by key
   */
  get(key: string): Promise<KVEntry | null>

  /**
   * Set a key-value pair
   * Creates new entry if key doesn't exist, updates if it does
   */
  set(key: string, value: string): Promise<KVEntry>

  /**
   * Delete an entry by key
   * Returns true if entry was deleted, false if it didn't exist
   */
  delete(key: string): Promise<boolean>

  /**
   * Delete all entries
   */
  clear(): Promise<void>

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>

  /**
   * Get count of all entries
   */
  count(): Promise<number>

  /**
   * Search entries by key pattern (simple substring match)
   */
  search(pattern: string): Promise<KVEntry[]>
}

/**
 * Storage strategy type identifier
 */
export type StorageType = 'localStorage' | 's3'
