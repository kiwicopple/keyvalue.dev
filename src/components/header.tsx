"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg">keyvalue.dev</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <a href="#features">Features</a>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <a href="#api">API</a>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <a href="#quickstart">Quick Start</a>
          </Button>
          <Button size="sm" className="ml-2" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Button variant="ghost" className="justify-start text-muted-foreground" asChild>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground" asChild>
              <a href="#api" onClick={() => setMobileMenuOpen(false)}>API</a>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground" asChild>
              <a href="#quickstart" onClick={() => setMobileMenuOpen(false)}>Quick Start</a>
            </Button>
            <Button className="mt-2" asChild>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
