"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Plus, RefreshCw, Database, ArrowLeft } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Database as DatabaseType } from "@/lib/storage"

export default function NewKeyPage() {
  const params = useParams()
  const router = useRouter()
  const databaseId = params.id as string

  const { isLoading, addEntry, refresh } = useKVStore(databaseId)
  const { getDatabase } = useDatabases()
  const { setBreadcrumbs, setDescription, setIsRefreshing, setOnRefresh } = useDashboardHeader()

  const [database, setDatabase] = useState<DatabaseType | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Load database info
  useEffect(() => {
    async function loadDb() {
      setIsLoadingDb(true)
      const db = await getDatabase(databaseId)
      setDatabase(db)
      setIsLoadingDb(false)
    }
    loadDb()
  }, [databaseId, getDatabase])

  // Set up header
  useEffect(() => {
    if (database) {
      setBreadcrumbs([
        { label: "Databases", href: "/dashboard" },
        { label: database.name, href: `/dashboard/db/${databaseId}` },
        { label: "New Entry" }
      ])
      setDescription("Create a new key-value entry")
    }
    setOnRefresh(() => refresh)
    return () => {
      setBreadcrumbs([])
      setDescription("")
      setOnRefresh(null)
    }
  }, [database, databaseId, setBreadcrumbs, setDescription, setOnRefresh, refresh])

  // Sync loading state
  useEffect(() => {
    setIsRefreshing(isLoading)
  }, [isLoading, setIsRefreshing])

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!key.trim()) {
      setError("Key is required")
      return
    }

    setIsCreating(true)
    setError("")
    try {
      await addEntry(key.trim(), value)
      router.push(`/dashboard/db/${databaseId}/key/${encodeURIComponent(key.trim())}`)
    } catch {
      setError("Failed to create entry")
      setIsCreating(false)
    }
  }, [databaseId, key, value, addEntry, router])

  if (isLoadingDb) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!database) {
    return (
      <div className="text-center py-12">
        <Database className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Database not found</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard">Back to Databases</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold">New Entry</h1>
        <p className="text-sm text-muted-foreground">Create a new key-value pair in {database.name}</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="my-key"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Textarea
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={12}
            className="font-mono text-sm"
            placeholder="Enter value..."
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-border/60 bg-background/95 backdrop-blur-sm z-40">
        <div className="flex items-center h-14 px-4 lg:px-8 gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0"
          >
            <Link href={`/dashboard/db/${databaseId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0"
          >
            <Link href={`/dashboard/db/${databaseId}`}>
              Cancel
            </Link>
          </Button>

          <Button onClick={handleCreate} disabled={isCreating} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Create Entry"}
          </Button>
        </div>
      </div>
    </div>
  )
}
