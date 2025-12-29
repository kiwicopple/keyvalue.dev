"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Plus, Search, Trash2, Edit, RefreshCw, Database, Key, MoreHorizontal, X, ChevronRight, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
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
    <div className={cn("space-y-6 pb-20 overflow-x-hidden", isFilterOpen && "pt-14 lg:pt-0")}>
      {/* Mobile Search Bar - fixed at top when filter is open */}
      {isFilterOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 px-4 py-3 border-b border-border bg-background z-30">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search keys and values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 flex-1"
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
        </div>
      )}

      {/* Page Header - hidden on mobile when filter is open */}
      <div className={cn("min-w-0", isFilterOpen && "hidden lg:block")}>
        <h1 className="text-base font-medium truncate">{database.name}</h1>
        <p className="text-xs text-muted-foreground truncate mt-1">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Databases</Link>
          <span className="mx-1.5">/</span>
          <span className="text-muted-foreground/60">{database.name}</span>
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive px-3 py-2 border border-destructive/50">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div className="text-center py-12 border border-border">
          <Key className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No entries yet</p>
        </div>
      )}

      {/* Entries List */}
      {!isLoading && entries.length > 0 && (
        <div className="-mx-4 lg:mx-0 lg:border lg:border-border divide-y divide-border border-y border-border lg:border-y-0 overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No entries match your search</p>
            </div>
          ) : filteredEntries.map((entry) => (
            <Link
              key={entry.key}
              href={`/dashboard/db/${databaseId}/key/${encodeURIComponent(entry.key)}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 active:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <code className="text-sm block truncate">{entry.key}</code>
                <span className="text-xs text-muted-foreground truncate block mt-0.5">
                  {truncateValue(entry.value, 80)}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-56 border-t border-border bg-background z-40">
        <div className="flex items-center h-12 px-4 lg:px-6 gap-2">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
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

          {/* Desktop: show search in footer */}
          {isFilterOpen ? (
            <div className="hidden lg:flex flex-1 items-center gap-2">
              <Input
                placeholder="Search keys and values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className="shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 lg:hidden" />
          {!isFilterOpen && <div className="hidden lg:block flex-1" />}
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
