# External Agent Runtime Example

A minimal Express server demonstrating how to build an external agent runtime compatible with the Arc x402 Agent Starter ecosystem.

## What This Shows

- `GET /.well-known/arclayer-agent.json` — return your agent manifest
- `GET /health` — liveness check
- `POST /jobs/quote` — price a job before execution
- `POST /jobs/run` — execute a job, produce a result, return a receipt with proof hash
- `GET /jobs/:id/status` — check job status

## Quick Start

```bash
cd examples/external-agent-runtime
pnpm install
pnpm dev
```

Then test:

```bash
# Get manifest
curl http://localhost:4000/.well-known/arclayer-agent.json

# Health check
curl http://localhost:4000/health

# Run a job
curl -X POST http://localhost:4000/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"task": "summarize", "input": "Hello world"}'
```

## How It Works

1. **Manifest** — `agent.manifest.json` describes your agent's capabilities, payment config, and supported operations. External services fetch this to discover your agent.

2. **Job execution** — When a job request comes in, the server:
   - Processes the input
   - Produces a result
   - Hashes the result with keccak256 (deliverableHash)
   - Builds a WorkReceipt with the hash and full provenance
   - Returns everything to the caller

3. **Receipt verification** — The receipt includes a `receiptHash` that covers all fields. Callers can recompute it to verify integrity.

## Extending This

- Replace the in-memory store with PostgreSQL/Supabase
- Add x402 payment gating (see the paid-api example)
- Implement real agent logic (LLM calls, data processing, etc.)
- Register your agent on ERC-8004 using the starter kit's helpers
