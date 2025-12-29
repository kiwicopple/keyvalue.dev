"use client"

import { useState, useCallback, useEffect } from "react"
import { Trash2, Info } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export default function SettingsPage() {
  const { databases, deleteDatabase, refresh } = useDatabases()
  const { setBreadcrumbs, setDescription } = useDashboardHeader()
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Set up header breadcrumbs
  useEffect(() => {
    setBreadcrumbs([{ label: "Settings" }])
    setDescription("Manage your dashboard preferences and data")
    return () => {
      setBreadcrumbs([])
      setDescription("")
    }
  }, [setBreadcrumbs, setDescription])

  const handleClearAll = useCallback(async () => {
    setIsClearing(true)
    try {
      // Delete all databases
      for (const db of databases) {
        await deleteDatabase(db.id)
      }
      await refresh()
      setIsClearDialogOpen(false)
    } catch (error) {
      console.error("Failed to clear all data:", error)
    } finally {
      setIsClearing(false)
    }
  }, [databases, deleteDatabase, refresh])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-base font-medium">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your dashboard preferences and data</p>
      </div>

      {/* About */}
      <div className="border border-border">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">About</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm">Version</p>
              <p className="text-xs text-muted-foreground">Current dashboard version</p>
            </div>
            <Badge variant="outline" className="text-xs">0.1.0</Badge>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-sm mb-1">Description</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              keyvalue.dev is a simple key-value storage solution. This dashboard allows you to manage
              multiple databases using your browser&apos;s localStorage.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-destructive/50">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-destructive/50">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Danger Zone</span>
        </div>
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm">Delete All Data</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete all databases and their entries.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsClearDialogOpen(true)}
              disabled={databases.length === 0}
              className="gap-2 shrink-0"
            >
              <Trash2 className="h-3 w-3" />
              Delete All
            </Button>
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {databases.length} database{databases.length !== 1 ? 's' : ''} and
              all their entries? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:opacity-90"
            >
              {isClearing ? "Deleting..." : "Delete All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
