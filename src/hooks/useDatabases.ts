"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Database, DatabaseStorageStrategy } from '@/lib/storage'
import { LocalDatabaseStorageStrategy } from '@/lib/storage'

// Create a singleton instance of the database storage strategy
const dbStorage: DatabaseStorageStrategy = new LocalDatabaseStorageStrategy()

export function useDatabases() {
  const [databases, setDatabases] = useState<Database[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDatabases = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await dbStorage.getAllDatabases()
      setDatabases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load databases')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDatabases()
  }, [loadDatabases])

  const createDatabase = useCallback(async (name: string, description?: string) => {
    try {
      setError(null)
      const db = await dbStorage.createDatabase(name, description)
      // Optimistic update: add to state directly instead of full reload
      setDatabases(prev => [db, ...prev])
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
      // Optimistic update: update in state directly instead of full reload
      if (db) {
        setDatabases(prev => prev.map(d => d.id === id ? db : d))
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
      // Optimistic update: remove from state directly instead of full reload
      if (deleted) {
        setDatabases(prev => prev.filter(d => d.id !== id))
      }
      return deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete database')
      throw err
    }
  }, [])

  const getDatabase = useCallback(async (id: string) => {
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
