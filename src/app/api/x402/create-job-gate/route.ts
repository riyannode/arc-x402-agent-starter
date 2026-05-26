import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402';

export const runtime = 'nodejs';

const AMOUNT_ATOMIC = '1'; // 0.000001 USDC, 6 decimals
const RESOURCE = '/api/x402/create-job-gate';

/**
 * Create-job gate handler — anti-spam fee before ERC-8183 job creation.
 *
 * After paying, the client proceeds to call createJob on the contract.
 */
async function handler(_req: NextRequest) {
  return NextResponse.json({
    ok: true,
    unlocked: true,
    message: 'Anti-spam job creation fee paid. Proceed with createJob.',
    resource: RESOURCE,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withX402(handler, {
  amount: process.env.X402_CREATE_JOB_GATE_AMOUNT_ATOMIC || AMOUNT_ATOMIC,
  resource: RESOURCE,
  description:
    'Anti-spam job creation fee — prevents spam jobs on the marketplace.',
  requireResourceContext: false,
});

export const POST = GET;
