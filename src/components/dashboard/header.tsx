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

