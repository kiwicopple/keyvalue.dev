"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Save, RefreshCw, Database, ArrowLeft } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Database as DatabaseType } from "@/lib/storage"

export default function EditDatabasePage() {
  const params = useParams()
  const router = useRouter()
  const databaseId = params.id as string

  const { getDatabase, updateDatabase } = useDatabases()
  const { setBreadcrumbs, setDescription } = useDashboardHeader()

  const [database, setDatabase] = useState<DatabaseType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setFormDescription] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Load database info
  useEffect(() => {
    async function loadDb() {
      setIsLoading(true)
      const db = await getDatabase(databaseId)
      setDatabase(db)
      if (db) {
        setName(db.name)
        setFormDescription(db.description || "")
      }
      setIsLoading(false)
    }
    loadDb()
  }, [databaseId, getDatabase])

  // Set up header
  useEffect(() => {
    if (database) {
      setBreadcrumbs([
        { label: "Databases", href: "/dashboard" },
        { label: database.name, href: `/dashboard/db/${databaseId}` },
        { label: "Edit" }
      ])
      setDescription("Update database settings")
    }
    return () => {
      setBreadcrumbs([])
      setDescription("")
    }
  }, [database, databaseId, setBreadcrumbs, setDescription])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setIsSaving(true)
    setError("")
    try {
      await updateDatabase(databaseId, name.trim(), description.trim() || undefined)
      router.push(`/dashboard/db/${databaseId}`)
    } catch {
      setError("Failed to update database")
      setIsSaving(false)
    }
  }, [databaseId, name, description, updateDatabase, router])

  if (isLoading) {
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
        <h1 className="text-xl font-semibold">Edit Database</h1>
        <p className="text-sm text-muted-foreground">Update settings for {database.name}</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Database"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            placeholder="A brief description of this database..."
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

          <Button onClick={handleSave} disabled={isSaving} size="sm" className="shrink-0">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
