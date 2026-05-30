# Arc x402 Agent Runtime Starter

**Forkable primitives for paid AI-agent APIs on Arc Testnet.**

Build paid agent APIs using x402 pay-per-call, ERC-8004 agent identity, ERC-8183 job lifecycle helpers, payload hashes, and verifiable receipts — all on Arc (Circle's L1 where USDC is native gas).

---

## What Primitives Does This Expose?

| Primitive | Import From | What It Does |
|-----------|-------------|--------------|
| x402 Middleware | `@/lib/x402` | `withX402()` — one-line payment gating for any API route |
| ERC-8004 Helpers | `@/lib/arc/erc8004` | `buildRegisterAgentConfig()`, `parseAgentIdFromTransferReceipt()` |
| ERC-8183 Lifecycle | `@/lib/arc/erc8183` | Full job lifecycle: `createJob` → `setBudget` → `approve` → `fund` → `submit` → `complete` |
| Agent Manifest | `@/lib/manifest` | Schema + defaults for `.well-known/arclayer-agent.json` |
| Proof & Receipts | `@/lib/proof` | `hashPayload()`, `buildWorkReceipt()`, `InMemoryReceiptStore` |
| External Runtime Example | `examples/external-agent-runtime/` | Standalone agent server with manifest + job endpoints |
| Paid API Example | `examples/paid-api/` | How to protect any endpoint with x402 |

---

## Quick Start

```bash
git clone <your-fork>
cd arc-x402-agent-starter
pnpm install
cp .env.example .env.local   # only REOWN_PROJECT_ID is required
pnpm dev
```

Open http://localhost:3000, connect wallet, and try:
1. **Unlock protected resource** — pay 0.000001 USDC via x402
2. **Register an agent** — ERC-8004 registration (demo or real)
3. **Create a job** — ERC-8183 job with escrow lifecycle
4. **View receipts** — payment + work receipt history

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for detailed setup.

---

## Demo Mode vs Real Mode

| | Demo Mode (default) | Real Mode |
|---|---|---|
| **x402 payments** | Parse-only, simulated txHash | Real EIP-3009 verification + settlement |
| **Agent registration** | Random ID after delay | On-chain `register()` call |
| **Job creation** | Random ID after delay | On-chain `createJob()` call |
| **Receipts** | In-memory (lost on refresh) | Needs persistent DB |

**Demo mode does NOT verify real payment settlement.** It parses the X-PAYMENT header structure and returns a simulated transaction hash. In-memory receipts are lost on refresh.

**Real mode** requires contract addresses in `.env.local` and actual USDC on Arc Testnet. Get testnet USDC from [faucet.circle.com](https://faucet.circle.com).

---

## Fork This If You Want To Build…

- **Paid AI agent API** — wrap your LLM/data endpoints with `withX402()`
- **Agent marketplace** — use ERC-8004 for identity + ERC-8183 for job escrow
- **Oracle service** — expose pricing/data with x402 gating + verifiable receipts
- **External agent runtime** — reference `examples/external-agent-runtime/` for the pattern
- **Any x402-gated API** — one line: `export const GET = withX402(handler, { amount: '10000' })`

---

## Architecture

```
src/
├── app/
│   ├── .well-known/arclayer-agent.json/  ← Agent manifest endpoint
│   ├── api/x402/                         ← x402-protected API routes
│   ├── proof/                            ← Proof & receipt viewer
│   └── page.tsx                          ← Homepage with all UI cards
├── components/                           ← React components
├── hooks/                                ← Custom hooks (wallet, x402, agents, jobs)
└── lib/
    ├── arc/
    │   ├── erc8004.ts                    ← Agent identity helpers
    │   └── erc8183.ts                    ← Job lifecycle builders
    ├── manifest/
    │   ├── schema.ts                     ← Manifest TypeScript types
    │   └── default-manifest.ts           ← Default manifest values
    ├── proof/
    │   ├── hash.ts                       ← Payload hashing (keccak256)
    │   ├── receipt.ts                    ← WorkReceipt builder
    │   ├── store.ts                      ← ReceiptStore interface
    │   └── index.ts                      ← Public exports
    ├── x402.ts                           ← Payment middleware
    ├── abis.ts                           ← Contract ABIs
    ├── arc.ts                            ← Chain constants & addresses
    ├── writes.ts                         ← ERC-8183 lifecycle builders
    └── receipt.ts                        ← x402 receipt types
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design.

---

## Env Vars

```bash
cp .env.example .env.local
```

**Required:** `NEXT_PUBLIC_REOWN_PROJECT_ID` (get one free at [cloud.reown.com](https://cloud.reown.com))

**For real mode:**
```env
NEXT_PUBLIC_CONTRACT_IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
NEXT_PUBLIC_CONTRACT_AGENTIC_COMMERCE=0x0747EEf0706327138c69792bF28Cd525089e4583
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
X402_RECEIVER_ADDRESS=0xYourReceiverAddress
```

All other vars are optional — demo mode works without them.

---

## Safety & Production Notes

**Do not use demo mode in production.** Demo mode does NOT verify real payment settlement. It parses the X-PAYMENT header and returns a simulated transaction hash.

**In-memory receipts are not production storage.** The `InMemoryReceiptStore` loses data on process restart. Implement the `ReceiptStore` interface with PostgreSQL, Supabase, or another persistent backend.

**Real production requires:**
- Proper x402 verification and settlement (not parse-only)
- Persistent receipt storage (PostgreSQL, Supabase, etc.)
- Rate limiting on protected routes
- Dedicated Arc RPC (not free tier)
- Error monitoring (Sentry, PostHog)
- Secure key management (never commit private keys)

---

## Docs

| Doc | Covers |
|-----|--------|
| [QUICKSTART.md](docs/QUICKSTART.md) | Setup, demo vs real mode, troubleshooting |
| [PRIMITIVES.md](docs/PRIMITIVES.md) | All importable primitives with usage examples |
| [AGENT_MANIFEST.md](docs/AGENT_MANIFEST.md) | Agent manifest schema and customization |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | File structure, data flow, module design |
| [X402_FLOW.md](docs/X402_FLOW.md) | EIP-3009 payment flow, challenge/response |
| [AGENT_FLOW.md](docs/AGENT_FLOW.md) | ERC-8004 agent registration lifecycle |
| [JOB_FLOW.md](docs/JOB_FLOW.md) | ERC-8183 job creation and lifecycle |
| [PITFALLS.md](docs/PITFALLS.md) | Real bugs & gotchas (evaluator, BigInt, decimals, gas) |
| [PROOF_RECEIPTS.md](docs/PROOF_RECEIPTS.md) | Receipt data model, verification |
| [PRODUCTION_HARDENING.md](docs/PRODUCTION_HARDENING.md) | Production readiness checklist |

---

## License

MIT
