"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Edit, Trash2, RefreshCw, Database, ArrowLeft } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Database as DatabaseType } from "@/lib/storage"

export default function KeyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const databaseId = params.id as string
  const keyName = decodeURIComponent(params.key as string)

  const { entries, isLoading, deleteEntry, refresh } = useKVStore(databaseId)
  const { getDatabase } = useDatabases()
  const { setBreadcrumbs, setDescription, setIsRefreshing, setOnRefresh } = useDashboardHeader()

  const [database, setDatabase] = useState<DatabaseType | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  // Set up header
  useEffect(() => {
    if (database) {
      setBreadcrumbs([
        { label: "Databases", href: "/dashboard" },
        { label: database.name, href: `/dashboard/db/${databaseId}` },
        { label: keyName }
      ])
      setDescription("View key-value entry")
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

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteEntry(keyName)
      router.push(`/dashboard/db/${databaseId}`)
    } catch {
      // Error handled by hook
    }
  }

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
      <div className="min-w-0">
        <h1 className="text-base font-medium font-mono truncate">{entry.key}</h1>
        <p className="text-xs text-muted-foreground truncate">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Databases</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/dashboard/db/${databaseId}`} className="hover:text-foreground transition-colors">{database.name}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-muted-foreground/60 font-mono">{entry.key}</span>
        </p>
      </div>

      {/* Value Display */}
      <div className="-mx-4 lg:mx-0 overflow-hidden">
        <div className="border-y border-border lg:border bg-muted/10">
          <pre className="p-4 text-sm whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden max-h-[60vh]">
            {entry.value || <span className="text-muted-foreground italic">Empty value</span>}
          </pre>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-56 border-t border-border bg-background z-40">
        <div className="flex items-center h-12 px-4 lg:px-6 gap-2">
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
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button asChild size="sm" className="shrink-0">
            <Link href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(keyName)}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <code className="text-primary">{keyName}</code>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
