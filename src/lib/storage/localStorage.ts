import type { KVEntry, StorageStrategy } from './types'

const STORAGE_KEY = 'keyvalue_dev_data'

/**
 * LocalStorage implementation of the StorageStrategy interface
 * Stores all key-value pairs in browser's localStorage
 */
export class LocalStorageStrategy implements StorageStrategy {
  private getStorageData(): Record<string, KVEntry> {
    if (typeof window === 'undefined') {
      return {}
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  private setStorageData(data: Record<string, KVEntry>): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
