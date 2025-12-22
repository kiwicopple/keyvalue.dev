import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, Shield, Code, ArrowRight, Terminal, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <span className="font-bold text-xl">keyvalue.dev</span>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          Built on AWS S3 Express One Zone
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
          Simple, Fast Key-Value Storage for Developers
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Store and retrieve data with single-digit millisecond latency.
          A simple HTTP API that just works.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="#quickstart">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#api">View API Docs</a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete key-value storage solution designed for simplicity and performance.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Blazing Fast</CardTitle>
              <CardDescription>
                Single-digit millisecond latency with strong consistency guarantees.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Code className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Simple HTTP API</CardTitle>
              <CardDescription>
                GET, PUT, DELETE. That&apos;s it. No complex SDKs or configurations needed.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure by Default</CardTitle>
              <CardDescription>
                Per-tenant isolation with dedicated S3 buckets. Your data stays yours.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Database className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Large Values</CardTitle>
              <CardDescription>
                Store up to 10MB per value. Perfect for documents, configs, and more.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Optimistic Concurrency</CardTitle>
              <CardDescription>
                Built-in ETag support for conditional writes. No race conditions.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Terminal className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Developer Friendly</CardTitle>
              <CardDescription>
                Works with curl, fetch, or any HTTP client. No dependencies required.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quickstart" className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get up and running in seconds. Just use curl or any HTTP client.
            </p>
          </div>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`# Store a value
curl -X PUT https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"hello": "world"}'

# Retrieve a value
curl https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a value
curl -X DELETE https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN"`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">API Reference</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four endpoints. That&apos;s all you need to know.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Badge className="w-fit bg-green-600 hover:bg-green-600">PUT</Badge>
              <CardTitle className="font-mono text-lg mt-2">/v1/kv/{"{key}"}</CardTitle>
              <CardDescription>
                Store a value. Supports If-Match and If-None-Match headers for conditional writes.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit bg-blue-600 hover:bg-blue-600">GET</Badge>
              <CardTitle className="font-mono text-lg mt-2">/v1/kv/{"{key}"}</CardTitle>
              <CardDescription>
                Retrieve a value by key. Returns 404 if not found.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit bg-red-600 hover:bg-red-600">DELETE</Badge>
              <CardTitle className="font-mono text-lg mt-2">/v1/kv/{"{key}"}</CardTitle>
              <CardDescription>
                Delete a value by key. Returns 204 on success.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit bg-yellow-600 hover:bg-yellow-600">HEAD</Badge>
              <CardTitle className="font-mono text-lg mt-2">/v1/kv/{"{key}"}</CardTitle>
              <CardDescription>
                Get metadata (ETag, Content-Length, Content-Type) without the body.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Start storing data in minutes. No complex setup, no maintenance headaches.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="#quickstart">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span className="font-semibold">keyvalue.dev</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by AWS S3 Express One Zone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
