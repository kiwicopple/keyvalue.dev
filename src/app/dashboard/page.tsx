"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Plus, Database, Trash2, Edit, RefreshCw, ChevronRight, Search, X } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export default function DashboardPage() {
  const { databases, isLoading, error, updateDatabase, deleteDatabase, refresh } = useDatabases()
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

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [selectedDatabase, setSelectedDatabase] = useState<{ id: string; name: string } | null>(null)
  const [formError, setFormError] = useState("")

  // Handle edit database
  const handleEdit = useCallback(async () => {
    if (!selectedDatabase || !formName.trim()) {
      setFormError("Name is required")
      return
    }
    try {
      await updateDatabase(selectedDatabase.id, formName.trim(), formDescription.trim() || undefined)
      setIsEditDialogOpen(false)
      setSelectedDatabase(null)
      setFormName("")
      setFormDescription("")
      setFormError("")
    } catch {
      setFormError("Failed to update database")
    }
  }, [selectedDatabase, formName, formDescription, updateDatabase])

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

  // Open edit dialog
  const openEditDialog = useCallback((id: string, name: string, description?: string) => {
    setSelectedDatabase({ id, name })
    setFormName(name)
    setFormDescription(description || "")
    setFormError("")
    setIsEditDialogOpen(true)
  }, [])

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
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold">Databases</h1>
        <p className="text-sm text-muted-foreground">Manage your key-value databases</p>
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
      {!isLoading && databases.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
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
        <div className="-mx-4 lg:mx-0 lg:border lg:border-border/60 lg:rounded-lg divide-y divide-border/60 border-y border-border/60 lg:border-y-0">
          {filteredDatabases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No databases match your search</p>
            </div>
          ) : filteredDatabases.map((db) => (
            <div
              key={db.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              <Link
                href={`/dashboard/db/${db.id}`}
                className="flex-1 min-w-0"
              >
                <span className="font-medium truncate block">{db.name}</span>
                <span className="text-sm text-muted-foreground truncate block mt-0.5">
                  {db.description || `Updated ${formatRelativeTime(db.updatedAt)}`}
                </span>
              </Link>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.preventDefault()
                    openEditDialog(db.id, db.name, db.description)
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    openDeleteDialog(db.id, db.name)
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refresh()}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {isFilterOpen ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Search databases..."
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
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4 mr-2" />
              New Database
            </Link>
          </Button>
        </div>
      </div>

      {/* Edit Database Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Database</DialogTitle>
            <DialogDescription>
              Update the database name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{selectedDatabase?.name}</span>?
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
