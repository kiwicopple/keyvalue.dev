"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader, DashboardHeaderProvider } from "@/components/dashboard/header"
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
            <DashboardHeader />
            <main className="flex-1 overflow-x-hidden">
              <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardHeaderProvider>
    </TooltipProvider>
  )
}
