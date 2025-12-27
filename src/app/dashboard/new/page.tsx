"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Database, HardDrive, Cloud } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewDatabasePage() {
  const router = useRouter()
  const { createDatabase } = useDatabases()
  const { setBreadcrumbs, setDescription: setHeaderDescription } = useDashboardHeader()

  // Set up header breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: "Databases", href: "/dashboard" },
      { label: "New Database" }
    ])
    setHeaderDescription("Set up a new key-value database to store your data")
    return () => {
      setBreadcrumbs([])
      setHeaderDescription("")
    }
  }, [setBreadcrumbs, setHeaderDescription])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [storageType, setStorageType] = useState("localStorage")
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const db = await createDatabase(name.trim(), description.trim() || undefined)
      router.push(`/dashboard/db/${db.id}`)
    } catch {
      setError("Failed to create database")
      setIsCreating(false)
    }
  }, [name, description, createDatabase, router])

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Form */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Database Details</CardTitle>
          <CardDescription>
            Configure your new database settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Database"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A brief description of this database..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Storage Type */}
          <div className="space-y-2">
            <Label htmlFor="storage-type">Storage Type</Label>
            <Select value={storageType} onValueChange={setStorageType}>
              <SelectTrigger id="storage-type">
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="localStorage">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span>LocalStorage</span>
                  </div>
                </SelectItem>
                <SelectItem value="s3" disabled>
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span>AWS S3</span>
                    <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {storageType === "localStorage"
                ? "Data will be stored in your browser's localStorage. Data persists across sessions but is limited to this browser."
                : "Data will be stored in AWS S3 for server-side persistence and cross-device access."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} className="gap-2">
              <Database className="h-4 w-4" />
              {isCreating ? "Creating..." : "Create Database"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
