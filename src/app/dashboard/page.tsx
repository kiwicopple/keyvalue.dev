"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Plus, Database, Trash2, Edit, RefreshCw, ChevronRight } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card className="gradient-bg-subtle border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Databases</CardTitle>
          <Database className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{databases.length}</div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-4">
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
      {!isLoading && databases.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No databases yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first database
              </p>
              <Button asChild className="gap-2">
                <Link href="/dashboard/new">
                  <Plus className="h-4 w-4" />
                  Create Database
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database List */}
      {!isLoading && databases.length > 0 && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((db) => (
            <Card key={db.id} className="border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{db.name}</CardTitle>
                    {db.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {db.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault()
                            openEditDialog(db.id, db.name, db.description)
                          }}
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
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault()
                            openDeleteDialog(db.id, db.name)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(db.updatedAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{formatDate(db.updatedAt)}</TooltipContent>
                  </Tooltip>
                  <Link href={`/dashboard/db/${db.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      Open
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
