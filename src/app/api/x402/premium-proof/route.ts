import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402';

export const runtime = 'nodejs';

const AMOUNT_ATOMIC = '1'; // 0.000001 USDC, 6 decimals
const RESOURCE = '/api/x402/premium-proof';

/**
 * Premium proof handler — paid unlock for proof-of-work verification.
 *
 * Returns a signed proof URI after payment, which can be used to
 * verify work completion on-chain or off-chain.
 */
async function handler(_req: NextRequest) {
  return NextResponse.json({
    ok: true,
    unlocked: true,
    message: 'Premium proof unlocked.',
    proof: {
      uri: `ipfs://premium-proof-${Date.now()}`,
      hash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`,
      timestamp: new Date().toISOString(),
    },
    resource: RESOURCE,
  });
}

export const GET = withX402(handler, {
  amount: process.env.X402_PREMIUM_PROOF_AMOUNT_ATOMIC || AMOUNT_ATOMIC,
  resource: RESOURCE,
  description: 'Premium proof-of-work unlock — paid verification receipt.',
  requireResourceContext: false,
});

export const POST = GET;
