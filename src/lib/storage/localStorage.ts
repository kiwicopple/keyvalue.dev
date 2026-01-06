import type { Database, KVEntry, StorageStrategy, DatabaseStorageStrategy } from './types'

const DATABASES_KEY = 'keyvalue_dev_databases'
const DATA_PREFIX = 'keyvalue_dev_db_'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Simple in-memory cache to avoid repeated JSON parsing
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 100 // ms - short TTL to handle external changes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

function invalidateCache(key: string): void {
  cache.delete(key)
}

/** Clear all cached data - useful for testing */
export function clearStorageCache(): void {
  cache.clear()
}

/**
 * LocalStorage implementation of the StorageStrategy interface
 * Stores all key-value pairs for a specific database in browser's localStorage
 */
export class LocalStorageStrategy implements StorageStrategy {
  private databaseId: string

  constructor(databaseId: string) {
    this.databaseId = databaseId
  }

  private get storageKey(): string {
    return `${DATA_PREFIX}${this.databaseId}`
  }

  private getStorageData(): Record<string, KVEntry> {
    if (typeof window === 'undefined') {
      return {}
    }

    // Check cache first
    const cached = getCached<Record<string, KVEntry>>(this.storageKey)
    if (cached) {
      return cached
    }

    try {
      const data = localStorage.getItem(this.storageKey)
      const parsed = data ? JSON.parse(data) : {}
      setCache(this.storageKey, parsed)
      return parsed
    } catch {
      return {}
    }
  }

  private setStorageData(data: Record<string, KVEntry>): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(this.storageKey, JSON.stringify(data))
    setCache(this.storageKey, data) // Update cache on write
  }

  async getAll(): Promise<KVEntry[]> {
    const data = this.getStorageData()
    return Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async get(key: string): Promise<KVEntry | null> {
    const data = this.getStorageData()
    return data[key] || null
  }

  async set(key: string, value: string): Promise<KVEntry> {
    const data = this.getStorageData()
    const now = Date.now()

    const existing = data[key]
    const entry: KVEntry = {
      key,
      value,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    data[key] = entry
    this.setStorageData(data)

    return entry
  }

  async delete(key: string): Promise<boolean> {
    const data = this.getStorageData()
    if (!(key in data)) {
      return false
    }

    delete data[key]
    this.setStorageData(data)
    return true
  }

  async clear(): Promise<void> {
    this.setStorageData({})
    invalidateCache(this.storageKey)
  }

  async exists(key: string): Promise<boolean> {
    const data = this.getStorageData()
    return key in data
  }

  async count(): Promise<number> {
    const data = this.getStorageData()
    return Object.keys(data).length
  }

  async search(pattern: string): Promise<KVEntry[]> {
    const data = this.getStorageData()
    const lowerPattern = pattern.toLowerCase()

    return Object.values(data)
      .filter(entry =>
        entry.key.toLowerCase().includes(lowerPattern) ||
        entry.value.toLowerCase().includes(lowerPattern)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }
}

/**
 * LocalStorage implementation of the DatabaseStorageStrategy interface
 * Manages multiple databases in browser's localStorage
 */
export class LocalDatabaseStorageStrategy implements DatabaseStorageStrategy {
  private getDatabases(): Record<string, Database> {
    if (typeof window === 'undefined') {
      return {}
    }

    // Check cache first
    const cached = getCached<Record<string, Database>>(DATABASES_KEY)
    if (cached) {
      return cached
    }

    try {
      const data = localStorage.getItem(DATABASES_KEY)
      const parsed = data ? JSON.parse(data) : {}
      setCache(DATABASES_KEY, parsed)
      return parsed
    } catch {
      return {}
    }
  }

  private setDatabases(data: Record<string, Database>): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(DATABASES_KEY, JSON.stringify(data))
    setCache(DATABASES_KEY, data) // Update cache on write
  }

  async getAllDatabases(): Promise<Database[]> {
    const data = this.getDatabases()
    return Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getDatabase(id: string): Promise<Database | null> {
    const data = this.getDatabases()
    return data[id] || null
  }

  async createDatabase(name: string, description?: string): Promise<Database> {
    const data = this.getDatabases()
    const now = Date.now()
    const id = generateId()

    const database: Database = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    }

    data[id] = database
    this.setDatabases(data)

    return database
  }

  async updateDatabase(id: string, name: string, description?: string): Promise<Database | null> {
    const data = this.getDatabases()
    const existing = data[id]

    if (!existing) {
      return null
    }

    const updated: Database = {
      ...existing,
      name,
      description,
      updatedAt: Date.now(),
    }

    data[id] = updated
    this.setDatabases(data)

    return updated
  }

  async deleteDatabase(id: string): Promise<boolean> {
    const data = this.getDatabases()

    if (!(id in data)) {
      return false
    }

    // Delete the database
    delete data[id]
    this.setDatabases(data)

    // Also delete all entries for this database
    const entriesKey = `${DATA_PREFIX}${id}`
    if (typeof window !== 'undefined') {
      localStorage.removeItem(entriesKey)
    }
    invalidateCache(entriesKey)

    return true
  }

  getStorageForDatabase(databaseId: string): StorageStrategy {
    return new LocalStorageStrategy(databaseId)
  }
}
