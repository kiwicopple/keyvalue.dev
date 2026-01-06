"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import type { DatabaseStorageStrategy } from '@/lib/storage'
import { LocalDatabaseStorageStrategy } from '@/lib/storage'
import { dataStore } from '@/lib/storage/store'

// Create a singleton instance of the database storage strategy
const dbStorage: DatabaseStorageStrategy = new LocalDatabaseStorageStrategy()

export function useDatabases() {
  // Subscribe to store changes for instant updates across routes
  const databases = useSyncExternalStore(
    dataStore.subscribe,
    () => dataStore.getDatabases(),
    () => [] // Server snapshot
  )

  const [isLoading, setIsLoading] = useState(!dataStore.isDatabasesLoaded())
  const [error, setError] = useState<string | null>(null)

  const loadDatabases = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await dbStorage.getAllDatabases()
      dataStore.setDatabases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load databases')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount only if not already loaded
  useEffect(() => {
    if (!dataStore.isDatabasesLoaded()) {
      loadDatabases()
    }
  }, [loadDatabases])

  const createDatabase = useCallback(async (name: string, description?: string) => {
    try {
      setError(null)
      const db = await dbStorage.createDatabase(name, description)
      dataStore.addDatabase(db)
      return db
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create database')
      throw err
    }
  }, [])

  const updateDatabase = useCallback(async (id: string, name: string, description?: string) => {
    try {
      setError(null)
      const db = await dbStorage.updateDatabase(id, name, description)
      if (db) {
        dataStore.updateDatabase(id, db)
      }
      return db
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update database')
      throw err
    }
  }, [])

  const deleteDatabase = useCallback(async (id: string) => {
    try {
      setError(null)
      const deleted = await dbStorage.deleteDatabase(id)
      if (deleted) {
        dataStore.removeDatabase(id)
      }
      return deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete database')
      throw err
    }
  }, [])

  const getDatabase = useCallback(async (id: string) => {
    // Return from cache if available (instant)
    const cached = dataStore.getDatabase(id)
    if (cached) {
      return cached
    }

    // Otherwise fetch
    try {
      setError(null)
      return await dbStorage.getDatabase(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get database')
      throw err
    }
  }, [])

  return {
    databases,
    isLoading,
    error,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    getDatabase,
    refresh: loadDatabases,
  }
}

// Export the storage strategy getter for use in other hooks
export function getDatabaseStorage() {
  return dbStorage
}
