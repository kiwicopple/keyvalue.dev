"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { KVEntry } from '@/lib/storage'
import { LocalStorageStrategy } from '@/lib/storage'

export function useKVStore(databaseId: string) {
  const [entries, setEntries] = useState<KVEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create storage instance for this database
  const storage = useMemo(() => new LocalStorageStrategy(databaseId), [databaseId])

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await storage.getAll()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setIsLoading(false)
    }
  }, [storage])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const addEntry = useCallback(async (key: string, value: string) => {
    try {
      setError(null)
      await storage.set(key, value)
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
      throw err
    }
  }, [loadEntries, storage])

  const updateEntry = useCallback(async (key: string, value: string) => {
    try {
      setError(null)
      await storage.set(key, value)
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry')
      throw err
    }
  }, [loadEntries, storage])

  const deleteEntry = useCallback(async (key: string) => {
    try {
      setError(null)
      const deleted = await storage.delete(key)
      if (deleted) {
        await loadEntries()
      }
      return deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      throw err
    }
  }, [loadEntries, storage])

  const clearAll = useCallback(async () => {
    try {
      setError(null)
      await storage.clear()
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear entries')
      throw err
    }
  }, [loadEntries, storage])

  const searchEntries = useCallback(async (pattern: string) => {
    try {
      setError(null)
      if (!pattern.trim()) {
        await loadEntries()
        return
      }
      const results = await storage.search(pattern)
      setEntries(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search entries')
      throw err
    }
  }, [loadEntries, storage])

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
