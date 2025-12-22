export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-8 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            keyvalue.dev
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Simple, fast, durable key-value storage for developers.
          </p>
        </div>

        <div className="flex flex-col gap-8 w-full">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Features
            </h2>
            <ul className="flex flex-col gap-2 text-zinc-600 dark:text-zinc-400">
              <li>Strong consistency with single-digit millisecond latency</li>
              <li>Simple HTTP API: GET, PUT, DELETE</li>
              <li>Per-tenant isolation via dedicated S3 buckets</li>
              <li>Optimistic concurrency with ETags</li>
              <li>Up to 10MB per value</li>
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Quick Start
            </h2>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-zinc-800 dark:text-zinc-200">
{`# Store a value
curl -X PUT https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"hello": "world"}'

# Retrieve a value
curl https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a value
curl -X DELETE https://api.keyvalue.dev/v1/kv/mykey \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
              </pre>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              API Reference
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <code className="text-sm font-semibold text-green-600 dark:text-green-400">
                  PUT /v1/kv/{'{key}'}
                </code>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Store a value. Supports If-Match and If-None-Match headers for
                  conditional writes.
                </p>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  GET /v1/kv/{'{key}'}
                </code>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Retrieve a value by key. Returns 404 if not found.
                </p>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <code className="text-sm font-semibold text-red-600 dark:text-red-400">
                  DELETE /v1/kv/{'{key}'}
                </code>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Delete a value by key. Returns 204 on success.
                </p>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <code className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  HEAD /v1/kv/{'{key}'}
                </code>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Get metadata (ETag, Content-Length, Content-Type) without the
                  body.
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="text-sm text-zinc-500 dark:text-zinc-500">
          Powered by AWS S3 Express One Zone
        </footer>
      </main>
    </div>
  );
}
