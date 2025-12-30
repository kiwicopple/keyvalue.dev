"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, Menu, X } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"

const navigation = [
  { name: "Databases", href: "/dashboard" },
  { name: "Settings", href: "/dashboard/settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/db/")
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm font-mono">keyvalue.dev</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-56 bg-background transform transition-transform duration-200 ease-in-out",
          "right-0 border-l border-border lg:left-0 lg:right-auto lg:border-l-0 lg:border-r",
          "lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm font-mono">keyvalue.dev</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <UserMenu />
        </div>
      </aside>
    </>
  )
}
