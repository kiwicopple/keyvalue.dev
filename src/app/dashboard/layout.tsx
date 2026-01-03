"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeaderProvider } from "@/components/dashboard/header"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <DashboardHeaderProvider>
        <div className="min-h-screen bg-background flex overflow-x-hidden">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col lg:ml-0 min-w-0 pt-14 lg:pt-0">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </DashboardHeaderProvider>
    </TooltipProvider>
  )
}
