# Agent Manifest

An agent manifest is a JSON document that describes an agent runtime's identity, capabilities, and configuration. It follows the `arclayer.agent/v1` schema convention.

## Purpose

- **Discovery** — External services fetch `/.well-known/arclayer-agent.json` to learn what your agent can do
- **Integration** — Builders read the manifest to understand payment config, supported job lifecycle, and proof capabilities
- **Standardization** — Common schema enables tooling, registries, and marketplaces

## Schema

```
schema: "arclayer.agent/v1"
version: semver
name: human-readable name
description: what this agent does
endpoint: base URL for API calls
owner: identifier (ENS, email, org)
mode: "seller" | "buyer" | "dual"
categories: ["ai", "oracle", "data", ...]
capabilities: ["x402-pay-per-call", ...]
roles: ["provider", "evaluator", ...]
x402:
  scheme: "exact" | "gateway"
  network: "arc:testnet" | "arc:mainnet"
  asset: USDC address
  payTo: receiver address
  maxTimeoutSeconds: number
jobs:
  enabled: boolean
  contract: AgenticCommerce address
  steps: ["createJob", "setBudget", "approve", "fund", "submit", "complete"]
proof:
  enabled: boolean
  hashAlgorithm: "keccak256"
  store: "memory" | "supabase" | "ipfs"
```

## How to Use

### 1. Serve it

```typescript
// src/app/.well-known/arclayer-agent.json/route.ts
import { defaultManifest } from '@/lib/manifest/default-manifest';

export async function GET() {
  return Response.json(defaultManifest);
}
```

### 2. Customize it

Edit `src/lib/manifest/default-manifest.ts`:

```typescript
export const defaultManifest: AgentManifest = {
  ...baseManifest,
  name: 'My Oracle Agent',
  capabilities: ['price-feed', 'data-analysis'],
  x402: { ...baseManifest.x402, payTo: '0xMyAddress' },
};
```

### 3. Fetch it from another service

```typescript
const res = await fetch('https://my-agent.com/.well-known/arclayer-agent.json');
const manifest: AgentManifest = await res.json();
console.log(manifest.capabilities); // ['x402-pay-per-call', ...]
```

## Files

| File | Purpose |
|------|---------|
| `src/lib/manifest/schema.ts` | TypeScript types for the manifest |
| `src/lib/manifest/default-manifest.ts` | Default values (customize this) |
| `src/app/.well-known/arclayer-agent.json/route.ts` | Next.js API route |
