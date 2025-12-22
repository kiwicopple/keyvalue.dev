# keyvalue.dev

Simple, fast, durable key-value storage for developers.

## Overview

keyvalue.dev is a minimal HTTP API (GET/PUT/DELETE) backed by AWS S3 Express One Zone, with one directory bucket per customer.

## Features

- Strong read-after-write consistency
- Single-digit millisecond latency (same AZ)
- Per-tenant isolation via bucket-per-customer
- Optimistic concurrency with ETags
- Up to 10MB per value

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with S3 Express One Zone access

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ZONE_ID` - Availability zone ID (e.g., use1-az4)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## API Reference

Base URL: `https://api.keyvalue.dev/v1`

### Authentication

All requests require a Bearer token:
```
Authorization: Bearer YOUR_TOKEN
```

### Endpoints

#### PUT /kv/{key}

Store a value.

```bash
curl -X PUT https://api.keyvalue.dev/v1/kv/mykey \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hello": "world"}'
```

Headers:
- `Content-Type` - MIME type of the value
- `If-Match` (optional) - ETag for conditional update
- `If-None-Match: *` (optional) - Only create if key doesn't exist

Responses:
- `200 OK` - Updated
- `201 Created` - Created
- `412 Precondition Failed` - CAS conflict

#### GET /kv/{key}

Retrieve a value.

```bash
curl https://api.keyvalue.dev/v1/kv/mykey \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Responses:
- `200 OK` - Value returned
- `404 Not Found` - Key doesn't exist

#### DELETE /kv/{key}

Delete a value.

```bash
curl -X DELETE https://api.keyvalue.dev/v1/kv/mykey \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Responses:
- `204 No Content` - Deleted
- `404 Not Found` - Key doesn't exist

#### HEAD /kv/{key}

Get metadata only.

```bash
curl -I https://api.keyvalue.dev/v1/kv/mykey \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Returns headers:
- `ETag`
- `Content-Length`
- `Content-Type`

## Architecture

```
Client
  |
Next.js API (Node runtime)
  |
AWS S3 Express One Zone
  (1 directory bucket per tenant)
```

## Limits

| Item | Limit |
|------|-------|
| Max object size | 10 MB |
| Max key length | 1024 bytes |
| Keys per tenant | Soft-unlimited |

## License

MIT
