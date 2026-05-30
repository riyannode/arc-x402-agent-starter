# Primitives

This starter kit exposes the following reusable primitives. Each can be imported independently and used in your own projects.

## x402 Payment Middleware

```typescript
import { withX402, build402Challenge } from '@/lib/x402';
```

- `withX402(handler, opts)` — Higher-order function that wraps any Next.js route handler with x402 payment gating
- `build402Challenge(opts)` — Returns a 402 response with `accepts[]` array
- Demo mode: parse-only, simulated settlement
- Real mode: replace with `@x402/core` verification + settlement

## ERC-8004 Agent Identity

```typescript
import { buildRegisterAgentConfig, parseAgentIdFromTransferReceipt, buildAgentMetadata } from '@/lib/arc/erc8004';
```

- `buildRegisterAgentConfig(metadataURI)` — Build wagmi config for `register()` on IdentityRegistry
- `parseAgentIdFromTransferReceipt(receipt)` — Extract tokenId (agentId) from Transfer event
- `buildAgentMetadata(input)` — Create structured metadata JSON for registration
- `validateAgentMetadata(input)` — Validate metadata input before registration

## ERC-8183 Job Lifecycle

```typescript
import { buildCreateJobConfig, buildSetBudgetConfig, buildApproveUsdcConfig, buildFundJobConfig, buildSubmitDeliverableConfig, buildCompleteJobConfig } from '@/lib/arc/erc8183';
```

Full lifecycle builders (each returns a wagmi write config):
1. `buildCreateJobConfig(provider, evaluator, expiredAt, description, hook)` — Create a job
2. `buildSetBudgetConfig(jobId, amount)` — Set budget for a created job
3. `buildApproveUsdcConfig(amount)` — Approve USDC for escrow
4. `buildFundJobConfig(jobId)` — Fund the job with escrow
5. `buildSubmitDeliverableConfig(jobId, deliverable)` — Submit deliverable (worker)
6. `buildCompleteJobConfig(jobId, reason)` — Complete and settle (client/evaluator)

## Agent Manifest

```typescript
import type { AgentManifest } from '@/lib/manifest/schema';
import { defaultManifest } from '@/lib/manifest/default-manifest';
```

- `AgentManifest` type — Full manifest schema
- `.well-known/arclayer-agent.json` route — Serves the manifest for discovery

## Proof & Receipts

```typescript
import { hashPayload, verifyPayloadHash, buildWorkReceipt, verifyWorkReceipt, InMemoryReceiptStore } from '@/lib/proof';
```

- `hashPayload(payload)` — keccak256 of canonical JSON
- `verifyPayloadHash(payload, hash)` — Verify a payload matches an expected hash
- `buildWorkReceipt(input)` — Create a WorkReceipt with provenance
- `verifyWorkReceipt(receipt)` — Verify receipt integrity
- `InMemoryReceiptStore` — Demo receipt store (implement `ReceiptStore` for production)

## Examples

| Example | What It Shows |
|---------|---------------|
| `examples/external-agent-runtime/` | Standalone agent with manifest, health, quote, run, status endpoints |
| `examples/paid-api/README.md` | How to protect any API endpoint with x402 |
