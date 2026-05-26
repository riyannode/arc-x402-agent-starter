import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402';

export const runtime = 'nodejs';

const AMOUNT_ATOMIC = '1'; // 0.000001 USDC, 6 decimals
const RESOURCE = '/api/x402/register-gate';

/**
 * Register gate handler — anti-spam fee before ERC-8004 agent registration.
 *
 * After paying, the client proceeds to call registerAgent on the contract.
 */
async function handler(_req: NextRequest) {
  return NextResponse.json({
    ok: true,
    unlocked: true,
    message: 'Anti-spam registration fee paid. Proceed with registerAgent.',
    resource: RESOURCE,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withX402(handler, {
  amount: process.env.X402_REGISTER_GATE_AMOUNT_ATOMIC || AMOUNT_ATOMIC,
  resource: RESOURCE,
  description:
    'Anti-spam registration fee — prevents spam agent listings on the marketplace.',
  requireResourceContext: false,
});

export const POST = GET;
