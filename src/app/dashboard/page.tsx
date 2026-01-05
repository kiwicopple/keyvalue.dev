"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Plus, Database, RefreshCw, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDatabases } from "@/hooks/useDatabases"
import { useDashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const { databases, isLoading, error, refresh } = useDatabases()
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

  // Filter databases - memoized to avoid recalculation on every render
  const filteredDatabases = useMemo(() => {
    if (!searchQuery) return databases
    const query = searchQuery.toLowerCase()
    return databases.filter((db) =>
      db.name.toLowerCase().includes(query) ||
      db.description?.toLowerCase().includes(query)
    )
  }, [databases, searchQuery])

  return (
    <div className={cn("pb-20", isFilterOpen && "pt-14 lg:pt-0")}>
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
      <div className={cn("px-4 lg:px-6 py-6", isFilterOpen && "hidden lg:block")}>
        <h1 className="text-base font-medium">Databases</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your key-value databases</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive px-4 lg:px-6 py-2 border-y border-destructive/50">
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
        <div className="text-center py-12 mx-4 lg:mx-6 border border-border">
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
        <div className="divide-y divide-border border-y border-border">
          {filteredDatabases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No databases match your search</p>
            </div>
          ) : filteredDatabases.map((db) => (
            <Link
              key={db.id}
              href={`/dashboard/db/${db.id}`}
              className="block px-4 lg:px-6 py-3 hover:bg-accent/50 active:bg-accent transition-colors"
            >
              <div className="text-sm font-mono truncate">{db.name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {db.description || `Updated ${formatRelativeTime(db.updatedAt)}`}
              </div>
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
    </div>
  )
}
