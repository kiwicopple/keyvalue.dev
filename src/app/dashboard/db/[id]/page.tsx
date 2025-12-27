"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Plus, Search, Trash2, Edit, RefreshCw, Database, Key, Clock } from "lucide-react"

import { useKVStore } from "@/hooks/useKVStore"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { Database as DatabaseType } from "@/lib/storage"

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

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
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!database) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Database not found</h3>
              <p className="text-muted-foreground mb-4">
                The database you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <Link href="/dashboard">
                <Button>Back to Databases</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="gradient-bg-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card className="gradient-bg-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage</CardTitle>
            <Key className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LocalStorage</div>
            <p className="text-xs text-muted-foreground mt-1">Browser storage</p>
          </CardContent>
        </Card>
        <Card className="gradient-bg-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.length > 0 ? formatRelativeTime(entries[0].updatedAt) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Key-Value Store</CardTitle>
              <CardDescription className="mt-1">
                Manage key-value pairs in this database
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {entries.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearDialogOpen(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </Button>
              )}
              <Button onClick={openAddDialog} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Entry</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keys and values..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-4 mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && entries.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No entries match your search" : "Get started by adding your first key-value pair"}
              </p>
              {!searchQuery && (
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              )}
            </div>
          )}

          {/* Table - Desktop */}
          {!isLoading && entries.length > 0 && (
            <div className="hidden md:block rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[200px]">Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[150px]">Updated</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.key} className="border-border/50">
                      <TableCell className="font-medium">
                        <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm">
                          {entry.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openViewDialog(entry.key, entry.value)}
                          className="text-left hover:text-primary transition-colors cursor-pointer"
                        >
                          <code className="text-sm">{truncateValue(entry.value)}</code>
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <Tooltip>
                          <TooltipTrigger>{formatRelativeTime(entry.updatedAt)}</TooltipTrigger>
                          <TooltipContent>{formatDate(entry.updatedAt)}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(entry.key, entry.value)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(entry.key, entry.value)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Cards - Mobile */}
          {!isLoading && entries.length > 0 && (
            <div className="md:hidden space-y-3">
              {entries.map((entry) => (
                <Card key={entry.key} className="border-border/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm font-medium">
                          {entry.key}
                        </code>
                        <button
                          onClick={() => openViewDialog(entry.key, entry.value)}
                          className="mt-2 text-sm text-muted-foreground block text-left hover:text-foreground transition-colors w-full"
                        >
                          <code className="break-all">{truncateValue(entry.value, 100)}</code>
                        </button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatRelativeTime(entry.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(entry.key, entry.value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(entry.key, entry.value)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
