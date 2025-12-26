"use client"

import { useState, useCallback } from "react"
import { Database, HardDrive, Trash2, Info } from "lucide-react"

import { useDatabases } from "@/hooks/useDatabases"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

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
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your dashboard preferences and data
        </p>
      </div>

      {/* Storage Info */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Storage</CardTitle>
              <CardDescription>Current storage configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Storage Type</p>
              <p className="text-sm text-muted-foreground">Where your data is stored</p>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <Database className="h-3 w-3" />
              LocalStorage
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Databases</p>
              <p className="text-sm text-muted-foreground">Number of databases created</p>
            </div>
            <span className="text-sm font-medium">{databases.length}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Storage Location</p>
              <p className="text-sm text-muted-foreground">Data persists in your browser</p>
            </div>
            <span className="text-sm text-muted-foreground">Browser</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>About</CardTitle>
              <CardDescription>Information about keyvalue.dev</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">Current dashboard version</p>
            </div>
            <Badge variant="outline">0.1.0</Badge>
          </div>
          <Separator />
          <div className="py-2">
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground">
              keyvalue.dev is a simple key-value storage solution. This dashboard allows you to manage
              multiple databases using your browser&apos;s localStorage. In the future, S3 storage support
              will be added for server-side persistence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all databases and their entries. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsClearDialogOpen(true)}
              disabled={databases.length === 0}
              className="gap-2 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>

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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Deleting..." : "Delete All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
