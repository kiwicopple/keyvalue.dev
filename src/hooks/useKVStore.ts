"use client"

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react'
import type { KVEntry } from '@/lib/storage'
import { LocalStorageStrategy } from '@/lib/storage'
import { dataStore } from '@/lib/storage/store'

export function useKVStore(databaseId: string) {
  // Subscribe to store changes for instant updates across routes
  const entries = useSyncExternalStore(
    dataStore.subscribe,
    () => dataStore.getEntries(databaseId),
    () => [] // Server snapshot
  )

  const [isLoading, setIsLoading] = useState(!dataStore.isEntriesLoaded(databaseId))
  const [error, setError] = useState<string | null>(null)

  // Create storage instance for this database
  const storage = useMemo(() => new LocalStorageStrategy(databaseId), [databaseId])

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await storage.getAll()
      dataStore.setEntries(databaseId, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setIsLoading(false)
    }
  }, [databaseId, storage])

  // Load on mount only if not already loaded
  useEffect(() => {
    if (!dataStore.isEntriesLoaded(databaseId)) {
      loadEntries()
    }
  }, [databaseId, loadEntries])

  const addEntry = useCallback(async (key: string, value: string) => {
    try {
      setError(null)
      const entry = await storage.set(key, value)
      dataStore.addEntry(databaseId, entry)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
      throw err
    }
  }, [databaseId, storage])

  const updateEntry = useCallback(async (key: string, value: string) => {
    try {
      setError(null)
      const entry = await storage.set(key, value)
      dataStore.updateEntry(databaseId, entry)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry')
      throw err
    }
  }, [databaseId, storage])

  const deleteEntry = useCallback(async (key: string) => {
    try {
      setError(null)
      const deleted = await storage.delete(key)
      if (deleted) {
        dataStore.removeEntry(databaseId, key)
      }
      return deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      throw err
    }
  }, [databaseId, storage])

  const clearAll = useCallback(async () => {
    try {
      setError(null)
      await storage.clear()
      dataStore.clearEntries(databaseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear entries')
      throw err
    }
  }, [databaseId, storage])

  const searchEntries = useCallback(async (pattern: string) => {
    try {
      setError(null)
      if (!pattern.trim()) {
        const data = await storage.getAll()
        dataStore.setEntries(databaseId, data)
        return
      }
      const results = await storage.search(pattern)
      dataStore.setEntries(databaseId, results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search entries')
      throw err
    }
  }, [databaseId, storage])

  return {
    entries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAll,
    searchEntries,
    refresh: loadEntries,
  }
}
