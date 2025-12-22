"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <span className="font-bold text-xl">keyvalue.dev</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <a href="#features">Features</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="#api">API</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="#quickstart">Quick Start</a>
          </Button>
          <Button asChild>
            <a href="#quickstart">Get Started</a>
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
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#api" onClick={() => setMobileMenuOpen(false)}>API</a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#quickstart" onClick={() => setMobileMenuOpen(false)}>Quick Start</a>
            </Button>
            <Button className="mt-2" asChild>
              <a href="#quickstart" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
