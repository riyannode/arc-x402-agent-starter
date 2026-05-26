# Session Keys

> **⚠️ NOT IMPLEMENTED**
> Session keys are planned but not yet built. This document describes the design
> for future implementation.

## What are Session Keys?

Session keys allow a **delegated signer** (a temporary keypair) to act on behalf
of a user for a limited time with restricted permissions. This enables:

- **Gasless transactions** — the session key pays for itself
- **Batch approvals** — one user signature authorizes many actions
- **Background agents** — agent runs without prompting the user each time
- **Reduced friction** — no wallet popups for every micro-payment

## Proposed Design

### 1. Delegated Signer

```solidity
struct SessionKey {
    address signer;           // The delegated EOA
    uint48 expiry;           // Unix timestamp when key expires
    bytes4[] allowedMethods; // Function selectors this key can call
    uint256 spendLimit;     // Max USDC this key can spend total
    uint256 spent;          // Total USDC spent so far
    bool revoked;           // Whether the key has been revoked
}
```

### 2. Storage

Session keys are stored off-chain (or in a lightweight on-chain registry):

```typescript
interface SessionKeyRecord {
  id: string;
  userAddress: `0x${string}`;
  signerAddress: `0x${string}`;
  expiry: number;
  permissions: {
    allowedResources: string[];  // e.g. ["/api/x402/*"]
    spendLimit: string;          // Atomic USDC
    singleUse: boolean;          // One-shot vs reusable
  };
  revoked: boolean;
  createdAt: string;
}
```

### 3. Flow

```
User → Create session key (sign a EIP-712 message)
     → Store in local IndexedDB / server DB
     → Agent uses session key to sign x402 payments
     → Server checks: key valid? not expired? within spend limit?
     → Allow or reject
```

### 4. Revocation

- Keys can be revoked by the user at any time
- Revocation is enforced by checking a `revoked` flag on the server
- Future: on-chain revocation for trustless enforcement

## What Needs to Be Built

1. Session key generation UI (wallet signs a permission message)
2. `useSessionKey` hook (manage keys, check expiry/limits)
3. Server-side validation middleware (check key before processing x402)
4. Storage layer (IndexedDB + optional server DB)
5. Spend limit tracking (increment `spent` on each use)
6. Revocation UI (list active keys, revoke button)

## Why Not Now

This starter focuses on the **core flow**: wallet connects → x402 pays →
agent registers → job creates → proof unlocks. Session keys are a UX
optimization on top of this flow.

We wanted to ship something that works with standard wallets first,
then add session keys as a layer on top. The architecture supports this —
`useX402Pay` would gain an optional `sessionKey` parameter that skips
the EIP-3009 signature step when a valid session key exists.
