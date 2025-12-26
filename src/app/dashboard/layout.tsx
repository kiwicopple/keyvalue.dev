import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen gradient-bg flex">
        <DashboardSidebar />
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 lg:pl-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
