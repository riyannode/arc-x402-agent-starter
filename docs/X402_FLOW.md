# x402 Payment Flow

x402 is a pay-per-call protocol that lets API servers require a micro-payment
before returning a response. It uses **EIP-3009 TransferWithAuthorization** so
the client can authorize a USDC transfer without paying gas themselves.

## Protocol Steps

```
CLIENT                              SERVER
  │                                    │
  ├─ GET /resource                     │
  │   (no X-PAYMENT) ──────────────────┤
  │                                    ├─ 402 { accepts: [...] }
  │◄───────────────────────────────────┤
  │                                    │
  ├─ Pick matching requirement         │
  ├─ Sign EIP-3009 with wallet         │
  ├─ GET /resource                     │
  │   (X-PAYMENT: base64 payload) ─────┤
  │                                    ├─ Verify + settle
  │◄───────────────────────────────────┤
  │  200 { unlocked: true }            │
  │  PAYMENT-RESPONSE header           │
```

## Challenge Format

When a route is protected by `withX402()` and receives a request without the
`X-PAYMENT` header, it responds with HTTP 402 and JSON:

```json
{
  "accepts": [
    {
      "scheme": "exact",
      "network": "arc:testnet",
      "asset": "0x3600...0000",
      "amount": "1",
      "payTo": "0x...",
      "maxTimeoutSeconds": 600,
      "extra": { "name": "USDC", "decimals": 6, "symbol": "USDC" }
    }
  ],
  "message": "Payment required",
  "resource": "/api/x402/protected-resource"
}
```

## Client Flow (useX402Pay)

1. **Switch chain** — Ensure wallet is on Arc Testnet (5042002)
2. **Fetch challenge** — GET the protected resource; expect 402
3. **Find requirement** — Match USDC requirement from `accepts[]`
4. **Check balance** — Read USDC balance of the payer address
5. **Sign EIP-3009** — `eth_signTypedData_v4` with `TransferWithAuthorization` type
6. **Submit payment** — Retry GET with `X-PAYMENT` header (base64 of {x402Version, accepted, payload})
7. **Extract txHash** — Read `PAYMENT-RESPONSE` header from the 200 response

## EIP-3009 Domain

```json
{
  "name": "USDC",
  "version": "2",
  "chainId": 5042002,
  "verifyingContract": "0x3600000000000000000000000000000000000000"
}
```

## Server Flow (withX402 middleware)

1. **No X-PAYMENT header** → Return 402 challenge JSON
2. **Has X-PAYMENT** → Decode base64, validate structure
3. **DEMO**: Generate random txHash, proceed to handler
4. **PRODUCTION**: Verify EIP-3009 signature via Circle Gateway or `@x402/core`,
   then settle the USDC transfer on-chain
5. Attach `PAYMENT-RESPONSE` header with tx info

## Production Verification

Replace the demo settlement in `src/lib/x402.ts`:

```ts
// Instead of:
const txHash = randomTxHash();

// Use:
import { verify, settle } from '@x402/core';
const verified = await verify(paymentPayload);
if (!verified) return 402;
const tx = await settle(paymentPayload);
const txHash = tx.transactionHash;
```

## References

- [x402 spec](https://github.com/x402/x402)
- [Circle Gateway docs](https://docs.arc.io)
- [ERC-3009 (EIP-3009)](https://eips.ethereum.org/EIPS/eip-3009)
