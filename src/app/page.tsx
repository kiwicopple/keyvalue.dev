import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Database, Zap, Shield, Code, ArrowRight, Terminal, CheckCircle, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg grid-pattern" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              Open Source
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Simple{" "}
              <span className="text-gradient">Key-Value Storage</span>
              {" "}for Developers
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Store and retrieve data with single-digit millisecond latency.
              A simple HTTP API that just works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow text-base px-8" asChild>
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-border/50" asChild>
                <a href="#api">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A complete key-value storage solution designed for simplicity and performance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Low Latency</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Single-digit millisecond latency with strong consistency guarantees.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Simple HTTP API</CardTitle>
                <CardDescription className="text-muted-foreground">
                  GET, PUT, DELETE. That&apos;s it. No complex SDKs or configurations needed.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Secure by Default</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Per-tenant isolation with dedicated S3 buckets. Your data stays yours.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Large Values</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Store up to 10MB per value. Perfect for documents, configs, and more.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Optimistic Concurrency</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Built-in ETag support for conditional writes. No race conditions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Developer Friendly</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Works with curl, fetch, or any HTTP client. No dependencies required.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quickstart" className="relative py-24 sm:py-32 border-t border-border/50">
        <div className="absolute inset-0 gradient-bg-subtle" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Quick Start</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Started in Seconds</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Just use curl or any HTTP client. No SDK required.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="code-block rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">terminal</span>
              </div>
              <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
                <code className="text-muted-foreground">
                  <span className="text-primary/60"># Store a value</span>{"\n"}
                  <span className="text-foreground">curl</span> -X PUT https://api.keyvalue.dev/v1/kv/mykey \{"\n"}
                  {"  "}-H <span className="text-primary">&quot;Authorization: Bearer YOUR_TOKEN&quot;</span> \{"\n"}
                  {"  "}-H <span className="text-primary">&quot;Content-Type: application/json&quot;</span> \{"\n"}
                  {"  "}-d <span className="text-primary">&apos;{`{"hello": "world"}`}&apos;</span>{"\n\n"}
                  <span className="text-primary/60"># Retrieve a value</span>{"\n"}
                  <span className="text-foreground">curl</span> https://api.keyvalue.dev/v1/kv/mykey \{"\n"}
                  {"  "}-H <span className="text-primary">&quot;Authorization: Bearer YOUR_TOKEN&quot;</span>{"\n\n"}
                  <span className="text-primary/60"># Delete a value</span>{"\n"}
                  <span className="text-foreground">curl</span> -X DELETE https://api.keyvalue.dev/v1/kv/mykey \{"\n"}
                  {"  "}-H <span className="text-primary">&quot;Authorization: Bearer YOUR_TOKEN&quot;</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api" className="relative py-24 sm:py-32 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">API Reference</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four Endpoints</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              That&apos;s all you need to know.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="bg-card/50 border-border/50 hover:border-emerald-500/30 transition-colors group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-0 font-mono">PUT</Badge>
                  <CardTitle className="font-mono text-base">/v1/kv/{"{key}"}</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Store a value. Supports If-Match and If-None-Match headers for conditional writes.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-colors group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 border-0 font-mono">GET</Badge>
                  <CardTitle className="font-mono text-base">/v1/kv/{"{key}"}</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Retrieve a value by key. Returns 404 if not found.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-red-500/30 transition-colors group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 border-0 font-mono">DELETE</Badge>
                  <CardTitle className="font-mono text-base">/v1/kv/{"{key}"}</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Delete a value by key. Returns 204 on success.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-yellow-500/30 transition-colors group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-0 font-mono">HEAD</Badge>
                  <CardTitle className="font-mono text-base">/v1/kv/{"{key}"}</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Get metadata (ETag, Content-Length, Content-Type) without the body.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 border-t border-border/50 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
            Start storing data in minutes. No complex setup, no maintenance headaches.
          </p>
          <Button size="lg" className="glow text-base px-8" asChild>
            <Link href="/dashboard">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">keyvalue.dev</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
