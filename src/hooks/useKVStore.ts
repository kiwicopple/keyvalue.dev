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
      const entry = await storage.set(key, value)
      // Optimistic update: add to state directly instead of full reload
      setEntries(prev => {
        const filtered = prev.filter(e => e.key !== key)
        return [entry, ...filtered]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
      throw err
    }
  }, [storage])

  const updateEntry = useCallback(async (key: string, value: string) => {
    try {
      setError(null)
      const entry = await storage.set(key, value)
      // Optimistic update: update in state directly instead of full reload
      setEntries(prev => {
        const filtered = prev.filter(e => e.key !== key)
        return [entry, ...filtered]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry')
      throw err
    }
  }, [storage])

  const deleteEntry = useCallback(async (key: string) => {
    try {
      setError(null)
      const deleted = await storage.delete(key)
      // Optimistic update: remove from state directly instead of full reload
      if (deleted) {
        setEntries(prev => prev.filter(e => e.key !== key))
      }
      return deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      throw err
    }
  }, [storage])

  const clearAll = useCallback(async () => {
    try {
      setError(null)
      await storage.clear()
      // Optimistic update: clear state directly instead of full reload
      setEntries([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear entries')
      throw err
    }
  }, [storage])

  const searchEntries = useCallback(async (pattern: string) => {
    try {
      setError(null)
      if (!pattern.trim()) {
        const data = await storage.getAll()
        setEntries(data)
        return
      }
      const results = await storage.search(pattern)
      setEntries(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search entries')
      throw err
    }
  }, [storage])

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
