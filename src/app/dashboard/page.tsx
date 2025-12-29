"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Plus, Database, RefreshCw, ChevronRight, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
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

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}

export default function DashboardPage() {
  const { databases, isLoading, error, deleteDatabase, refresh } = useDatabases()
  const { setBreadcrumbs, setDescription, setIsRefreshing, setOnRefresh } = useDashboardHeader()

  // Set up header
  useEffect(() => {
    setBreadcrumbs([{ label: "Databases" }])
    setDescription("Manage your key-value databases")
    setOnRefresh(() => refresh)
    return () => {
      setBreadcrumbs([])
      setDescription("")
      setOnRefresh(null)
    }
  }, [setBreadcrumbs, setDescription, setOnRefresh, refresh])

  // Sync loading state with header
  useEffect(() => {
    setIsRefreshing(isLoading)
  }, [isLoading, setIsRefreshing])

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<{ id: string; name: string } | null>(null)

  // Handle delete database
  const handleDelete = useCallback(async () => {
    if (!selectedDatabase) return
    try {
      await deleteDatabase(selectedDatabase.id)
      setIsDeleteDialogOpen(false)
      setSelectedDatabase(null)
    } catch {
      // Error is handled by the hook
    }
  }, [selectedDatabase, deleteDatabase])

  // Open delete dialog
  const openDeleteDialog = useCallback((id: string, name: string) => {
    setSelectedDatabase({ id, name })
    setIsDeleteDialogOpen(true)
  }, [])

  // Filter databases
  const filteredDatabases = databases.filter((db) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      db.name.toLowerCase().includes(query) ||
      db.description?.toLowerCase().includes(query)
    )
  })

  return (
    <div className={cn("space-y-6 pb-20 overflow-x-hidden", isFilterOpen && "pt-14 lg:pt-0")}>
      {/* Mobile Search Bar - fixed at top when filter is open */}
      {isFilterOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 px-4 py-3 border-b border-border bg-background z-30">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search databases..."
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
      <div className={cn(isFilterOpen && "hidden lg:block")}>
        <h1 className="text-base font-medium">Databases</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your key-value databases</p>
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
      {!isLoading && databases.length === 0 && (
        <div className="text-center py-12 border border-border">
          <Database className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No databases yet</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Database
            </Link>
          </Button>
        </div>
      )}

      {/* Database List */}
      {!isLoading && databases.length > 0 && (
        <div className="-mx-4 lg:mx-0 lg:border lg:border-border divide-y divide-border border-y border-border lg:border-y-0 overflow-hidden">
          {filteredDatabases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No databases match your search</p>
            </div>
          ) : filteredDatabases.map((db) => (
            <Link
              key={db.id}
              href={`/dashboard/db/${db.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 active:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-mono truncate block">{db.name}</span>
                <span className="text-xs text-muted-foreground truncate block mt-0.5">
                  {db.description || `Updated ${formatRelativeTime(db.updatedAt)}`}
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
          {/* Desktop: show search in footer */}
          {isFilterOpen ? (
            <div className="hidden lg:flex flex-1 items-center gap-2">
              <Input
                placeholder="Search databases..."
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
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4 mr-2" />
              New Database
            </Link>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium font-mono text-foreground">{selectedDatabase?.name}</span>?
              This will permanently delete all key-value pairs stored in this database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
