"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, RefreshCw, ChevronRight } from "lucide-react"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

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
  const pathname = usePathname()
  const { breadcrumbs, description, isRefreshing, onRefresh } = useDashboardHeader()

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  // Don't show New Database button on the new page itself
  const showNewButton = pathname !== "/dashboard/new"

  return (
    <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-14 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold hidden sm:block">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

    </div>
  )
}
