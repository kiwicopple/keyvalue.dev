"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Plus, Search, Trash2, Edit, RefreshCw, Database, Key, MoreHorizontal, X, ChevronRight } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Database as DatabaseType } from "@/lib/storage"

function truncateValue(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value
  return value.substring(0, maxLength) + "..."
}

export default function DatabasePage() {
  const params = useParams()
  const databaseId = params.id as string

  const { entries, isLoading, error, deleteEntry, clearAll, refresh } = useKVStore(databaseId)
  const { getDatabase, deleteDatabase } = useDatabases()
  const router = useRouter()
  const { setBreadcrumbs, setDescription, setIsRefreshing, setOnRefresh } = useDashboardHeader()

  const [database, setDatabase] = useState<DatabaseType | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(true)

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

  // Set up header breadcrumbs and refresh
  useEffect(() => {
    if (database) {
      setBreadcrumbs([
        { label: "Databases", href: "/dashboard" },
        { label: database.name }
      ])
      setDescription(database.description || "Manage key-value entries")
    }
    setOnRefresh(() => refresh)
    return () => {
      setBreadcrumbs([])
      setDescription("")
      setOnRefresh(null)
    }
  }, [database, setBreadcrumbs, setDescription, setOnRefresh, refresh])

  // Sync loading state with header
  useEffect(() => {
    setIsRefreshing(isLoading)
  }, [isLoading, setIsRefreshing])

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isDeleteDbDialogOpen, setIsDeleteDbDialogOpen] = useState(false)

  // Entry to delete
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  // Filter entries locally
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entry.key.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query)
    )
  })

  // Handle delete entry
  const handleDeleteEntry = useCallback(async () => {
    if (!entryToDelete) return
    try {
      await deleteEntry(entryToDelete)
      setIsDeleteDialogOpen(false)
      setEntryToDelete(null)
    } catch {
      // Error is handled by the hook
    }
  }, [entryToDelete, deleteEntry])

  // Handle clear all
  const handleClearAll = useCallback(async () => {
    try {
      await clearAll()
      setIsClearDialogOpen(false)
    } catch {
      // Error is handled by the hook
    }
  }, [clearAll])

  // Open delete dialog
  const openDeleteDialog = useCallback((key: string) => {
    setEntryToDelete(key)
    setIsDeleteDialogOpen(true)
  }, [])

  // Handle delete database
  const handleDeleteDb = useCallback(async () => {
    try {
      await deleteDatabase(databaseId)
      router.push("/dashboard")
    } catch {
      // Error handled by hook
    }
  }, [databaseId, deleteDatabase, router])

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
      <div className="min-w-0">
        <h1 className="text-xl font-semibold truncate">{database.name}</h1>
        <p className="text-sm text-muted-foreground truncate">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Databases</Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-muted-foreground/60">{database.name}</span>
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive px-3 py-2 border border-destructive/30 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div className="text-center py-12">
          <Key className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No entries yet</p>
        </div>
      )}

      {/* Entries List */}
      {!isLoading && entries.length > 0 && (
        <div className="-mx-4 lg:mx-0 lg:border lg:border-border/60 lg:rounded-lg divide-y divide-border/60 border-y border-border/60 lg:border-y-0">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No entries match your search</p>
            </div>
          ) : filteredEntries.map((entry) => (
            <div
              key={entry.key}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              <Link
                href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(entry.key)}`}
                className="flex-1 min-w-0"
              >
                <code className="font-medium text-sm block truncate">{entry.key}</code>
                <span className="text-sm text-muted-foreground truncate block mt-0.5">
                  {truncateValue(entry.value, 80)}
                </span>
              </Link>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  asChild
                >
                  <Link href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(entry.key)}/edit`}>
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(entry.key)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-border/60 bg-background/95 backdrop-blur-sm z-40">
        <div className="flex items-center h-14 px-4 lg:px-8 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/db/${databaseId}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit Database
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsClearDialogOpen(true)}
                disabled={entries.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Entries
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDbDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Database
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isFilterOpen ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Search keys and values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsFilterOpen(false)
                  setSearchQuery("")
                }}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(true)}
                className="shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
            </>
          )}

          <Button asChild size="sm" className="shrink-0">
            <Link href={`/dashboard/db/${databaseId}/key/new`}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Delete Entry Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <code className="text-primary">{entryToDelete}</code>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Entries</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {entries.length} entries from this database?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Database Confirmation Dialog */}
      <AlertDialog open={isDeleteDbDialogOpen} onOpenChange={setIsDeleteDbDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{database?.name}</span>?
              This will permanently delete all {entries.length} entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDb} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
