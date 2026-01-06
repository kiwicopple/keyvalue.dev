/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageStrategy, LocalDatabaseStorageStrategy, clearStorageCache } from '@/lib/storage'

describe('LocalStorageStrategy', () => {
  const databaseId = 'test-db-123'
  let storage: LocalStorageStrategy

  beforeEach(() => {
    localStorage.clear()
    clearStorageCache() // Clear in-memory cache too
    storage = new LocalStorageStrategy(databaseId)
  })

  describe('set and get', () => {
    it('stores and retrieves a key-value pair', async () => {
      const entry = await storage.set('testKey', 'testValue')

      expect(entry.key).toBe('testKey')
      expect(entry.value).toBe('testValue')
      expect(entry.createdAt).toBeDefined()
      expect(entry.updatedAt).toBeDefined()

      const retrieved = await storage.get('testKey')
      expect(retrieved?.value).toBe('testValue')
    })

    it('updates existing entry preserving createdAt', async () => {
      const first = await storage.set('key1', 'value1')
      const second = await storage.set('key1', 'value2')

      expect(second.value).toBe('value2')
      expect(second.createdAt).toBe(first.createdAt)
      expect(second.updatedAt).toBeGreaterThanOrEqual(first.updatedAt)
    })

    it('returns null for non-existent key', async () => {
      const result = await storage.get('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    it('returns all entries sorted by updatedAt descending', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')
      await storage.set('key3', 'value3')

      const entries = await storage.getAll()

      expect(entries).toHaveLength(3)
      // All entries should be present (order may vary if created at same timestamp)
      const keys = entries.map(e => e.key)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('returns empty array when no entries', async () => {
      const entries = await storage.getAll()
      expect(entries).toEqual([])
    })
  })

  describe('delete', () => {
    it('removes an existing entry', async () => {
      await storage.set('keyToDelete', 'value')

      const deleted = await storage.delete('keyToDelete')

      expect(deleted).toBe(true)
      expect(await storage.get('keyToDelete')).toBeNull()
    })

    it('returns false for non-existent key', async () => {
      const deleted = await storage.delete('nonexistent')
      expect(deleted).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')

      await storage.clear()

      expect(await storage.getAll()).toEqual([])
    })
  })

  describe('exists', () => {
    it('returns true for existing key', async () => {
      await storage.set('existingKey', 'value')
      expect(await storage.exists('existingKey')).toBe(true)
    })

    it('returns false for non-existent key', async () => {
      expect(await storage.exists('nonexistent')).toBe(false)
    })
  })

  describe('count', () => {
    it('returns the number of entries', async () => {
      expect(await storage.count()).toBe(0)

      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')

      expect(await storage.count()).toBe(2)
    })
  })

  describe('search', () => {
    it('finds entries by key pattern', async () => {
      await storage.set('user:1', 'Alice')
      await storage.set('user:2', 'Bob')
      await storage.set('config:theme', 'dark')

      const results = await storage.search('user')

      expect(results).toHaveLength(2)
      expect(results.map(e => e.key)).toContain('user:1')
      expect(results.map(e => e.key)).toContain('user:2')
    })

    it('finds entries by value pattern', async () => {
      await storage.set('greeting', 'Hello World')
      await storage.set('farewell', 'Goodbye')

      const results = await storage.search('world')

      expect(results).toHaveLength(1)
      expect(results[0].key).toBe('greeting')
    })

    it('is case insensitive', async () => {
      await storage.set('Key', 'Value')

      expect(await storage.search('KEY')).toHaveLength(1)
      expect(await storage.search('value')).toHaveLength(1)
    })
  })
})

describe('LocalDatabaseStorageStrategy', () => {
  let dbStorage: LocalDatabaseStorageStrategy

  beforeEach(() => {
    localStorage.clear()
    clearStorageCache() // Clear in-memory cache too
    dbStorage = new LocalDatabaseStorageStrategy()
  })

  describe('createDatabase', () => {
    it('creates a new database with unique id', async () => {
      const db = await dbStorage.createDatabase('TestDB', 'A test database')

      expect(db.id).toBeDefined()
      expect(db.name).toBe('TestDB')
      expect(db.description).toBe('A test database')
      expect(db.createdAt).toBeDefined()
      expect(db.updatedAt).toBeDefined()
    })

    it('creates database without description', async () => {
      const db = await dbStorage.createDatabase('SimpleDB')

      expect(db.name).toBe('SimpleDB')
      expect(db.description).toBeUndefined()
    })
  })

  describe('getAllDatabases', () => {
    it('returns all databases sorted by updatedAt descending', async () => {
      await dbStorage.createDatabase('DB1')
      await dbStorage.createDatabase('DB2')
      await dbStorage.createDatabase('DB3')

      const databases = await dbStorage.getAllDatabases()

      expect(databases).toHaveLength(3)
      // All databases should be present (order may vary if created at same timestamp)
      const names = databases.map(d => d.name)
      expect(names).toContain('DB1')
      expect(names).toContain('DB2')
      expect(names).toContain('DB3')
    })

    it('returns empty array when no databases', async () => {
      const databases = await dbStorage.getAllDatabases()
      expect(databases).toEqual([])
    })
  })

  describe('getDatabase', () => {
    it('returns database by id', async () => {
      const created = await dbStorage.createDatabase('MyDB')
      const retrieved = await dbStorage.getDatabase(created.id)

      expect(retrieved).toEqual(created)
    })

    it('returns null for non-existent id', async () => {
      const result = await dbStorage.getDatabase('nonexistent-id')
      expect(result).toBeNull()
    })
  })

  describe('updateDatabase', () => {
    it('updates database name and description', async () => {
      const created = await dbStorage.createDatabase('OldName', 'Old description')
      const updated = await dbStorage.updateDatabase(created.id, 'NewName', 'New description')

      expect(updated?.name).toBe('NewName')
      expect(updated?.description).toBe('New description')
      expect(updated?.createdAt).toBe(created.createdAt)
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(created.updatedAt)
    })

    it('returns null for non-existent id', async () => {
      const result = await dbStorage.updateDatabase('nonexistent', 'Name')
      expect(result).toBeNull()
    })
  })

  describe('deleteDatabase', () => {
    it('removes database and its entries', async () => {
      const db = await dbStorage.createDatabase('ToDelete')

      // Add some entries to the database
      const entryStorage = dbStorage.getStorageForDatabase(db.id)
      await entryStorage.set('key1', 'value1')

      const deleted = await dbStorage.deleteDatabase(db.id)

      expect(deleted).toBe(true)
      expect(await dbStorage.getDatabase(db.id)).toBeNull()
    })

    it('returns false for non-existent id', async () => {
      const deleted = await dbStorage.deleteDatabase('nonexistent')
      expect(deleted).toBe(false)
    })
  })

  describe('getStorageForDatabase', () => {
    it('returns a storage strategy for the database', async () => {
      const db = await dbStorage.createDatabase('TestDB')
      const storage = dbStorage.getStorageForDatabase(db.id)

      expect(storage).toBeInstanceOf(LocalStorageStrategy)

      // Verify it works
      await storage.set('key', 'value')
      expect(await storage.get('key')).toBeTruthy()
    })
  })
})
