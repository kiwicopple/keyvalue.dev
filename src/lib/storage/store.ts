/**
 * Global data store for instant navigation
 * Caches data in memory so navigation between routes is instant
 */

import type { Database, KVEntry } from './types'

type Listener = () => void

interface Store {
  databases: Database[]
  databasesLoaded: boolean
  entries: Map<string, KVEntry[]>
  entriesLoaded: Set<string>
  listeners: Set<Listener>
}

const store: Store = {
  databases: [],
  databasesLoaded: false,
  entries: new Map(),
  entriesLoaded: new Set(),
  listeners: new Set(),
}

// Stable empty array reference to avoid useSyncExternalStore infinite loops
const EMPTY_ENTRIES: KVEntry[] = []

function notify() {
  store.listeners.forEach(listener => listener())
}

export const dataStore = {
  // Subscribe to changes
  subscribe(listener: Listener): () => void {
    store.listeners.add(listener)
    return () => store.listeners.delete(listener)
  },

  // Databases
  getDatabases(): Database[] {
    return store.databases
  },

  isDatabasesLoaded(): boolean {
    return store.databasesLoaded
  },

  setDatabases(databases: Database[]) {
    store.databases = databases
    store.databasesLoaded = true
    notify()
  },

  getDatabase(id: string): Database | undefined {
    return store.databases.find(db => db.id === id)
  },

  addDatabase(db: Database) {
    store.databases = [db, ...store.databases]
    notify()
  },

  updateDatabase(id: string, db: Database) {
    store.databases = store.databases.map(d => d.id === id ? db : d)
    notify()
  },

  removeDatabase(id: string) {
    store.databases = store.databases.filter(d => d.id !== id)
    store.entries.delete(id)
    store.entriesLoaded.delete(id)
    notify()
  },

  // Entries
  getEntries(databaseId: string): KVEntry[] {
    return store.entries.get(databaseId) || EMPTY_ENTRIES
  },

  isEntriesLoaded(databaseId: string): boolean {
    return store.entriesLoaded.has(databaseId)
  },

  setEntries(databaseId: string, entries: KVEntry[]) {
    store.entries.set(databaseId, entries)
    store.entriesLoaded.add(databaseId)
    notify()
  },

  getEntry(databaseId: string, key: string): KVEntry | undefined {
    const entries = store.entries.get(databaseId)
    return entries?.find(e => e.key === key)
  },

  addEntry(databaseId: string, entry: KVEntry) {
    const entries = store.entries.get(databaseId) || []
    const filtered = entries.filter(e => e.key !== entry.key)
    store.entries.set(databaseId, [entry, ...filtered])
    notify()
  },

  updateEntry(databaseId: string, entry: KVEntry) {
    const entries = store.entries.get(databaseId) || []
    const filtered = entries.filter(e => e.key !== entry.key)
    store.entries.set(databaseId, [entry, ...filtered])
    notify()
  },

  removeEntry(databaseId: string, key: string) {
    const entries = store.entries.get(databaseId) || []
    store.entries.set(databaseId, entries.filter(e => e.key !== key))
    notify()
  },

  clearEntries(databaseId: string) {
    store.entries.set(databaseId, [])
    notify()
  },
}
