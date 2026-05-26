# Proof & Receipts

## Receipt Data Model

After any paid interaction, a receipt is created with the following fields:

```typescript
interface X402Receipt {
  payer: `0x${string}`;      // Wallet that paid
  resource: string;           // Protected resource URL
  amount: string;             // Human-readable amount (e.g. "0.000001 USDC")
  amountAtomic: string;       // Atomic amount (6 decimals)
  txHash: string;             // On-chain transaction hash
  agentId?: string;           // ERC-8004 agent ID (if registration)
  jobId?: string;             // ERC-8183 job ID (if job creation)
  payloadHash?: string;       // Keccak256 hash of work payload
  proofURI?: string;          // URI to proof-of-work
  timestamp: string;          // ISO timestamp
}
```

## Receipt Verification

Receipts enable **verifiable provenance**:

1. **Payment verified** — `txHash` can be looked up on ArcScan
2. **Agent verified** — `agentId` can be queried on the IdentityRegistry
3. **Job verified** — `jobId` can be queried on AgenticCommerce
4. **Work verified** — `payloadHash` matches keccak256 of deliverable content
5. **Proof verified** — `proofURI` points to immutable storage (IPFS/Arweave)

## Demo Storage

In the starter kit, receipts are stored **in-memory** using a module-level
object. This means receipts are lost on page refresh.

For production:
- Store receipts in your backend database (PostgreSQL, Supabase)
- Store proof URIs on IPFS (Pinata, web3.storage)
- Index receipts by event from the contract

## Proof Unlock

The `/api/x402/premium-proof` endpoint demonstrates a paid proof unlock:
1. User pays x402 fee
2. Server generates a proof URI + payload hash
3. Receipt is created linking payment to the proof

In production, this would:
- Pin the work result to IPFS
- Record the hash on-chain
- Return a signed attestation
