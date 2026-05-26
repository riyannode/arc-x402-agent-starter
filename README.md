# arc-x402-agent-starter

Minimal Next.js starter kit for **Arc Network** builders.

Demonstrates the full **x402 pay-per-call + agent commerce** stack on Arc Testnet:

- **x402 payments** — EIP-3009 TransferWithAuthorization pay-per-call
- **ERC-8004** — Register AI agent identities
- **ERC-8183** — Create paid agent jobs with escrow
- **Proof & Receipts** — Verifiable payment + work receipts

---

## Quick Start

```bash
git clone <your-fork>
cd arc-x402-agent-starter
pnpm install
pnpm dev
```

Open http://localhost:3000, connect your wallet (MetaMask / WalletConnect), and try:

1. **Unlock protected resource** — pay 0.000001 USDC via x402
2. **Register an agent** — pay gate fee, then "register" (demo mode)
3. **Create a job** — fill in provider/evaluator/description, pay gate fee
4. **View receipts** — see all your payment + interaction history

---

## Primitives Exposed

| Primitive | Standard | Demo | Real Mode |
|-----------|----------|------|-----------|
| Pay-per-call | x402 / EIP-3009 | ✅ simulated settlement | ✅ Circle Gateway |
| Agent Identity | ERC-8004 | ✅ simulated | ✅ `registerAgent()` |
| Job Escrow | ERC-8183 | ✅ simulated | ✅ `createJob()` |
| Proof Receipt | x402 receipt | ✅ in-memory | ✅ DB + IPFS |
|| Wallet Connect | wagmi injected / MetaMask | ✅ real | ✅ real |

---

## How This Differs from `circlefin/arc-*` Examples

The official `circlefin/arc-*` repos (arc-commerce, arc-nanopayments, etc.) are protocol-level examples that demonstrate individual primitives in isolation.

This starter is **builder-oriented**:

- Combines **all primitives** in one app (x402 + agent identity + job escrow + receipts)
- Real UI with forms, status cards, and a live flow timeline
- Production-pattern code structure (hooks, lib, API routes, components)
- Ready to fork and extend into your own agent marketplace, work platform, or pay-per-call API

---

## Env Vars

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required: `NEXT_PUBLIC_REOWN_PROJECT_ID` (get one free at [cloud.reown.com](https://cloud.reown.com))

All other vars are optional — demo mode works without them.

See `.env.example` for the full list.

---

## Demo Mode vs Real Mode

### Demo Mode (default)
- No contract env vars → all operations are simulated
- x402 payments return demo transaction hashes
- `registerAgent()` and `createJob()` return random IDs after a delay
- Receipts stored in memory (lost on refresh)
- **No cost, no wallet transaction** needed beyond the signature

### Real Mode
Set these env vars:

```env
NEXT_PUBLIC_CONTRACT_IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
NEXT_PUBLIC_CONTRACT_AGENTIC_COMMERCE=0x0747EEf0706327138c69792bF28Cd525089e4583
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
X402_RECEIVER_ADDRESS=0x...
```

Then:
- `registerAgent()` calls ERC-8004 `register()` on-chain
- `createJob()` calls ERC-8183 `createJob()` on-chain
- x402 payments use real EIP-3009 verification + settlement

---

## Architecture

```
src/
├── app/
│   ├── api/x402/          ← x402-protected API routes (server)
│   ├── proof/             ← Proof & receipt viewer page
│   ├── globals.css        ← Tailwind base styles
│   ├── layout.tsx         ← Root layout with wallet provider
│   └── page.tsx           ← Homepage with all UI cards
├── components/            ← React components
├── hooks/                 ← Custom hooks (wallet, x402, agents, jobs)
└── lib/                   ← Core logic (wagmi, x402, ABIs, receipts)
```

See `docs/ARCHITECTURE.md` for detailed design.

---

## Production Hardening Checklist

1. **Replace demo x402 settlement** — Use `@x402/core` or Circle Gateway for real EIP-3009 verification
2. **Persist receipts** — Store in PostgreSQL / Supabase instead of in-memory
3. **Add rate limiting** — Prevent abuse on x402-protected routes
4. **Use a proper RPC** — Replace dRPC free tier with dedicated Arc RPC
5. **Add error monitoring** — Sentry / PostHog for production observability
6. **Secure env vars** — Rotate `X402_RECEIVER_ADDRESS` and any private keys
7. **Hosting** — Deploy to Vercel, Railway, or your own infrastructure

See `docs/PRODUCTION_HARDENING.md` for the full checklist.

---

## Docs

| Doc | Covers |
|-----|--------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | File structure, data flow, module design |
| [X402_FLOW.md](docs/X402_FLOW.md) | EIP-3009 payment flow, challenge/response |
| [AGENT_FLOW.md](docs/AGENT_FLOW.md) | ERC-8004 agent registration lifecycle |
| [JOB_FLOW.md](docs/JOB_FLOW.md) | ERC-8183 job creation and lifecycle |
| [PROOF_RECEIPTS.md](docs/PROOF_RECEIPTS.md) | Receipt data model, verification |
| [SESSION_KEYS.md](docs/SESSION_KEYS.md) | Session keys: planned, not yet implemented |
| [PRODUCTION_HARDENING.md](docs/PRODUCTION_HARDENING.md) | Production readiness checklist |

---

## License

MIT
