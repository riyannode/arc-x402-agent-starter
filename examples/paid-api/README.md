# Paid API Example

Shows how to protect any API endpoint with x402 payment gating using the starter kit's middleware.

## The Pattern

```
Request without payment → 402 Challenge (tells client how to pay)
Request with payment    → 200 Response + receipt
```

## Code

```typescript
// src/app/api/my-paid-endpoint/route.ts

import { withX402 } from '@/lib/x402';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  // Your actual API logic here
  const data = { message: 'This data costs 0.01 USDC', timestamp: Date.now() };
  return NextResponse.json(data);
}

// Wrap with x402 — one line to add payment gating
export const GET = withX402(handler, {
  amount: '10000', // 0.01 USDC (6 decimals)
  resource: '/api/my-paid-endpoint',
  description: 'Access premium data',
});
```

## What Happens

### Demo Mode (default)
1. Client sends GET → server returns 402 with `accepts[]` challenge
2. Client signs an EIP-3009 TransferWithAuthorization
3. Client sends GET with `X-PAYMENT` header containing the signed authorization
4. Server **parses** the header (does NOT verify on-chain) and returns 200 + demo txHash
5. Response includes `PAYMENT-RESPONSE` header with settlement info

### Real Mode
Set `X402_RECEIVER_ADDRESS` and replace the demo verification in `x402.ts` with:
- Real EIP-3009 signature verification
- On-chain settlement via `transferWithAuthorization`
- Or Circle Gateway settlement

## Testing

```bash
# 1. Get the 402 challenge
curl -i http://localhost:3000/api/x402/protected-resource
# → 402 with accepts[] JSON

# 2. With a payment header (demo mode accepts any valid structure)
curl -H "X-PAYMENT: <base64-encoded-payment>" \
     http://localhost:3000/api/x402/protected-resource
# → 200 with data + receipt
```

## Key Points

- **Demo mode** = parse-only, no real settlement. Great for development.
- **Real mode** = actual EIP-3009 verification + on-chain settlement. Requires proper setup.
- The `withX402` wrapper is the only thing you need — your handler stays clean.
- Receipts are returned in the `PAYMENT-RESPONSE` header.
