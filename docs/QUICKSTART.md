# Quick Start

Get the starter kit running in under 2 minutes.

## 1. Clone & Install

```bash
git clone <your-fork>
cd arc-x402-agent-starter
pnpm install
```

## 2. Configure

```bash
cp .env.example .env.local
```

Only **one** env var is required:

```
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
```

Get one free at [cloud.reown.com](https://cloud.reown.com). All other vars are optional — demo mode works without them.

## 3. Run

```bash
pnpm dev
```

Open http://localhost:3000, connect your wallet (MetaMask / WalletConnect), and try:

1. **Unlock protected resource** — pay 0.000001 USDC via x402
2. **Register an agent** — pay gate fee, then "register" (demo mode)
3. **Create a job** — fill in provider/evaluator/description, pay gate fee
4. **View receipts** — see all your payment + interaction history

## 4. Make It Yours

### Import a primitive

```typescript
// In your own project
import { withX402 } from '@/lib/x402';
import { buildCreateJobConfig } from '@/lib/arc/erc8183';
import { hashPayload } from '@/lib/proof';
```

### Protect your own API

```typescript
// src/app/api/premium/route.ts
import { withX402 } from '@/lib/x402';

async function handler() {
  return Response.json({ data: 'premium content' });
}

export const GET = withX402(handler, {
  amount: '10000', // 0.01 USDC
  resource: '/api/premium',
});
```

### Run the external agent example

```bash
cd examples/external-agent-runtime
pnpm install
pnpm dev
# → http://localhost:4000/.well-known/arclayer-agent.json
```

## Demo Mode vs Real Mode

| | Demo Mode (default) | Real Mode |
|---|---|---|
| **Setup** | Only `REOWN_PROJECT_ID` | Add contract addresses + receiver |
| **x402 payments** | Parse-only, simulated txHash | Real EIP-3009 verification + settlement |
| **Agent registration** | Random ID after delay | On-chain `register()` call |
| **Job creation** | Random ID after delay | On-chain `createJob()` call |
| **Receipts** | In-memory (lost on refresh) | Persistent storage needed |
| **Cost** | Free (signature only) | Real USDC |

### Switch to Real Mode

```env
NEXT_PUBLIC_CONTRACT_IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
NEXT_PUBLIC_CONTRACT_AGENTIC_COMMERCE=0x0747EEf0706327138c69792bF28Cd525089e4583
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
X402_RECEIVER_ADDRESS=0xYourReceiverAddress
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `transaction underpriced` | Set `maxFeePerGas` to at least 20 Gwei |
| `insufficient funds for gas` | Get testnet USDC from [faucet.circle.com](https://faucet.circle.com) |
| Wrong chain | Switch wallet to Arc Testnet (Chain ID 5042002) |
| `evaluator` revert | ERC-8183 requires non-zero evaluator — use your wallet address |
