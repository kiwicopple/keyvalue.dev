"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

// Types
export interface BreadcrumbItem {
  label: string
  href?: string
}

interface DashboardHeaderContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  description: string
  setDescription: (desc: string) => void
  isRefreshing: boolean
  setIsRefreshing: (value: boolean) => void
  onRefresh: (() => void) | null
  setOnRefresh: (fn: (() => void) | null) => void
}

// Context
const DashboardHeaderContext = createContext<DashboardHeaderContextType | null>(null)

export function useDashboardHeader() {
  const context = useContext(DashboardHeaderContext)
  if (!context) {
    throw new Error("useDashboardHeader must be used within DashboardHeaderProvider")
  }
  return context
}

// Provider
export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [description, setDescription] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null)

  return (
    <DashboardHeaderContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        description,
        setDescription,
        isRefreshing,
        setIsRefreshing,
        onRefresh,
        setOnRefresh: useCallback((fn: (() => void) | null) => setOnRefresh(() => fn), []),
      }}
    >
      {children}
    </DashboardHeaderContext.Provider>
  )
}

// Header Component
export function DashboardHeader() {
  return (
    <div className="hidden lg:block border-b border-border bg-background sticky top-0 z-30">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
      </div>
    </div>
  )
}
