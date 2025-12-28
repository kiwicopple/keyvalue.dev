"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Save, RefreshCw, Database, ArrowLeft } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Database as DatabaseType } from "@/lib/storage"

export default function EditKeyPage() {
  const params = useParams()
  const router = useRouter()
  const databaseId = params.id as string
  const keyName = decodeURIComponent(params.key as string)

  const { entries, isLoading, updateEntry, refresh } = useKVStore(databaseId)
  const { getDatabase } = useDatabases()
  const { setBreadcrumbs, setDescription, setIsRefreshing, setOnRefresh } = useDashboardHeader()

  const [database, setDatabase] = useState<DatabaseType | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Find the entry
  const entry = entries.find((e) => e.key === keyName)

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

  // Initialize value from entry
  useEffect(() => {
    if (entry) {
      setValue(entry.value)
    }
  }, [entry])

  // Set up header
  useEffect(() => {
    if (database) {
      setBreadcrumbs([
        { label: "Databases", href: "/dashboard" },
        { label: database.name, href: `/dashboard/db/${databaseId}` },
        { label: keyName, href: `/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}` },
        { label: "Edit" }
      ])
      setDescription("Edit key-value entry")
    }
    setOnRefresh(() => refresh)
    return () => {
      setBreadcrumbs([])
      setDescription("")
      setOnRefresh(null)
    }
  }, [database, databaseId, keyName, setBreadcrumbs, setDescription, setOnRefresh, refresh])

  // Sync loading state
  useEffect(() => {
    setIsRefreshing(isLoading)
  }, [isLoading, setIsRefreshing])

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setError("")
    try {
      await updateEntry(keyName, value)
      router.push(`/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}`)
    } catch {
      setError("Failed to update entry")
      setIsSaving(false)
    }
  }, [databaseId, keyName, value, updateEntry, router])

  if (isLoadingDb || isLoading) {
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

  if (!entry) {
    return (
      <div className="text-center py-12">
        <Database className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Entry not found</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/db/${databaseId}`}>Back to Database</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold">Edit Entry</h1>
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Databases</Link>
          <span className="mx-1.5">&gt;</span>
          <Link href={`/dashboard/db/${databaseId}`} className="hover:text-foreground transition-colors">{database.name}</Link>
          <span className="mx-1.5">&gt;</span>
          <Link href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}`} className="hover:text-foreground transition-colors font-mono">{keyName}</Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-muted-foreground/60">Edit</span>
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="key">Key</Label>
          <div className="px-3 py-2 bg-muted/50 border border-border/60 rounded-md text-sm font-mono">
            {keyName}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Textarea
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={12}
            className="font-mono md:text-sm"
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
            <Link href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}`}>
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
            <Link href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}`}>
              Cancel
            </Link>
          </Button>

          <Button onClick={handleSave} disabled={isSaving} size="sm" className="shrink-0">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
