# Architecture

## Overview

`arc-x402-agent-starter` follows a clean separation of concerns:

```
Browser (React)           Next.js Server           Arc Blockchain
    │                         │                        │
    ├─ ConnectWallet          │                        │
    │   └─ Reown AppKit ──────┤                        │
    │                         │                        │
    ├─ X402PayButton          │                        │
    │   └─ useX402Pay ────────┼── /api/x402/* ────── EIP-3009
    │                         │                        │
    ├─ RegisterAgentCard      │                        │
    │   └─ useAgentRegistry ──┼── useArcWrite ────── ERC-8004
    │                         │                        │
    ├─ CreateJobCard          │                        │
    │   └─ useJobFlow ────────┼── useArcWrite ────── ERC-8183
    │                         │                        │
    └─ ProofReceiptCard       │                        │
        └─ receipt.ts ────────┘                        │
```

## Layer Breakdown

### 1. `src/lib/` — Core Logic

| File | Responsibility |
|------|---------------|
| `arc.ts` | Network constants (chain ID, RPCs, addresses) |
| `wagmi.ts` | Reown AppKit + Wagmi config for Arc Testnet |
| `x402.ts` | Server-side `withX402()` middleware, 402 challenge builder |
| `abis.ts` | Canonical ERC-8004 + ERC-8183 + USDC ABIs |
| `contracts.ts` | Contract name resolution helper |
| `receipt.ts` | Receipt data model + in-memory store |
| `utils.ts` | Address formatting, USDC parsing, timestamps |

### 2. `src/hooks/` — React State

| Hook | Purpose |
|------|---------|
| `useArcWallet` | Wallet connection state, chain switching, Reown modal |
| `useArcWrite` | Contract write helpers for registerAgent + createJob |
| `useX402Pay` | Full x402 payment flow (challenge → sign → submit) |
| `useAgentRegistry` | Orchestrates x402 gate → registerAgent flow |
| `useJobFlow` | Orchestrates x402 gate → createJob flow |

### 3. `src/components/` — UI

| Component | Purpose |
|-----------|---------|
| `Providers` | Wagmi + TanStack Query provider tree |
| `ConnectWallet` | Wallet connection button with chain indicator |
| `X402PayButton` | One-click x402 payment for protected resources |
| `X402StatusCard` | Status display with icon + message |
| `RegisterAgentCard` | Agent registration form + flow |
| `CreateJobCard` | Job creation form + flow |
| `ProofReceiptCard` | Receipt display with all fields |
| `LiveFlowTimeline` | Visual flow progress indicator |

### 4. `src/app/api/x402/` — Server Routes

| Route | Purpose |
|-------|---------|
| `protected-resource` | Generic x402 pay-per-call demo |
| `register-gate` | Anti-spam gate before agent registration |
| `create-job-gate` | Anti-spam gate before job creation |
| `premium-proof` | Paid unlock for proof-of-work verification |

## Data Flow

### x402 Payment Flow

```
1. Browser → GET /api/x402/*     (no X-PAYMENT header)
2. Server  → 402 { accepts: [...] }
3. Browser → Parse accepts[], find USDC requirement
4. Browser → Check USDC balance on Arc
5. Browser → eth_signTypedData_v4 (EIP-3009)
6. Browser → GET /api/x402/*     (X-PAYMENT header)
7. Server  → Decode + verify payment → respond with PAYMENT-RESPONSE
```

### Agent Registration Flow

```
1. User fills metadata URI
2. useAgentRegistry → useX402Pay → /api/x402/register-gate
3. On payment success → useArcWrite → registerAgent(metadataURI)
4. Receipt stored in memory
```

### Job Creation Flow

```
1. User fills provider, evaluator, expiry, description
2. useJobFlow → useX402Pay → /api/x402/create-job-gate
3. On payment success → useArcWrite → createJob(...)
4. Receipt stored in memory
```

## Design Decisions

1. **In-memory receipts** — Simple for demo; production should use a database
2. **Demo mode by default** — So anyone can run without env vars
3. **`withX402()` middleware** — Reusable pattern for any API route
4. **Server-side 402 challenge** — Clean separation; client never hardcodes payment params
5. **`@reown/appkit/networks` `defineChain()`** — Reown's official way to define custom chains
