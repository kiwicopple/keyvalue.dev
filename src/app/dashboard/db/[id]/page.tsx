"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Plus, Search, Trash2, Edit, RefreshCw, Database, Key } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
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
import type { Database as DatabaseType } from "@/lib/storage"

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

function truncateValue(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value
  return value.substring(0, maxLength) + "..."
}

export default function DatabasePage() {
  const params = useParams()
  const databaseId = params.id as string

  const { entries, isLoading, error, addEntry, updateEntry, deleteEntry, clearAll, searchEntries, refresh } = useKVStore(databaseId)
  const { getDatabase } = useDatabases()
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Form state
  const [formKey, setFormKey] = useState("")
  const [formValue, setFormValue] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<{ key: string; value: string } | null>(null)
  const [formError, setFormError] = useState("")

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    await searchEntries(query)
  }, [searchEntries])

  // Handle add entry
  const handleAdd = useCallback(async () => {
    if (!formKey.trim()) {
      setFormError("Key is required")
      return
    }
    try {
      await addEntry(formKey.trim(), formValue)
      setIsAddDialogOpen(false)
      setFormKey("")
      setFormValue("")
      setFormError("")
    } catch {
      setFormError("Failed to add entry")
    }
  }, [formKey, formValue, addEntry])

  // Handle edit entry
  const handleEdit = useCallback(async () => {
    if (!selectedEntry) return
    try {
      await updateEntry(selectedEntry.key, formValue)
      setIsEditDialogOpen(false)
      setSelectedEntry(null)
      setFormValue("")
      setFormError("")
    } catch {
      setFormError("Failed to update entry")
    }
  }, [selectedEntry, formValue, updateEntry])

  // Handle delete entry
  const handleDelete = useCallback(async () => {
    if (!selectedEntry) return
    try {
      await deleteEntry(selectedEntry.key)
      setIsDeleteDialogOpen(false)
      setSelectedEntry(null)
    } catch {
      // Error is handled by the hook
    }
  }, [selectedEntry, deleteEntry])

  // Handle clear all
  const handleClearAll = useCallback(async () => {
    try {
      await clearAll()
      setIsClearDialogOpen(false)
    } catch {
      // Error is handled by the hook
    }
  }, [clearAll])

  // Open edit dialog
  const openEditDialog = useCallback((key: string, value: string) => {
    setSelectedEntry({ key, value })
    setFormValue(value)
    setFormError("")
    setIsEditDialogOpen(true)
  }, [])

  // Open delete dialog
  const openDeleteDialog = useCallback((key: string, value: string) => {
    setSelectedEntry({ key, value })
    setIsDeleteDialogOpen(true)
  }, [])

  // Open view dialog
  const openViewDialog = useCallback((key: string, value: string) => {
    setSelectedEntry({ key, value })
    setIsViewDialogOpen(true)
  }, [])

  // Open add dialog
  const openAddDialog = useCallback(() => {
    setFormKey("")
    setFormValue("")
    setFormError("")
    setIsAddDialogOpen(true)
  }, [])

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
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys and values..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClearDialogOpen(true)}
              className="text-destructive hover:text-destructive h-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={openAddDialog} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
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
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "No entries match your search" : "No entries yet"}
          </p>
          {!searchQuery && (
            <Button onClick={openAddDialog} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      )}

      {/* Entries List */}
      {!isLoading && entries.length > 0 && (
        <div className="-mx-4 lg:mx-0 lg:border lg:border-border/60 lg:rounded-lg divide-y divide-border/60 border-y border-border/60 lg:border-y-0">
          {entries.map((entry) => (
            <div
              key={entry.key}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              <button
                onClick={() => openViewDialog(entry.key, entry.value)}
                className="flex-1 min-w-0 text-left"
              >
                <code className="font-medium text-sm block truncate">{entry.key}</code>
                <span className="text-sm text-muted-foreground truncate block mt-0.5">
                  {truncateValue(entry.value, 80)}
                </span>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditDialog(entry.key, entry.value)
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(entry.key, entry.value)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Entry</DialogTitle>
            <DialogDescription>
              Create a new key-value pair in this database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-key">Key</Label>
              <Input
                id="add-key"
                placeholder="my-key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-value">Value</Label>
              <Textarea
                id="add-value"
                placeholder="Enter value..."
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={4}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>
              Update the value for <code className="text-primary">{selectedEntry?.key}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Textarea
                id="edit-value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={6}
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

      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <code className="text-primary bg-primary/10 px-2 py-1 rounded">{selectedEntry?.key}</code>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/50 rounded-md p-4 max-h-[400px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap break-all">{selectedEntry?.value}</pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (selectedEntry) {
                openEditDialog(selectedEntry.key, selectedEntry.value)
              }
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <code className="text-primary">{selectedEntry?.key}</code>?
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
    </div>
  )
}
