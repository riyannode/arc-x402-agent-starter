/**
 * Server-side x402 middleware — 402 Challenge / Payment Response helpers.
 *
 * These are DEMO helpers that return 402 challenge JSON with accepts[] and
 * check a `X-PAYMENT` header. Production code should use Circle Gateway or
 * a real verification + settlement flow (see docs/PRODUCTION_HARDENING.md).
 *
 * Architecture:
 * 1. Any GET request to a protected route returns a 402 Payment Required
 *    response with an `accepts[]` array describing what the server expects.
 * 2. The client signs an EIP-3009 TransferWithAuthorization and sends it
 *    as a base64-encoded `X-PAYMENT` header on a retry.
 * 3. The server (demo) decodes the header, logs the payment, and responds
 *    with `{ unlocked: true }` + a `PAYMENT-RESPONSE` header containing
 *    the simulated transaction hash.
 * 4. PRODUCTION: replace the demo check in `handler` with real
 *    `verify()` + `settle()` using @x402/core or Circle Gateway SDK.
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────────────────────────

export interface PaymentRequirement {
  scheme: string;
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface X402Challenge {
  accepts: PaymentRequirement[];
  message: string;
  resource: string;
  [key: string]: unknown;
}

export interface X402Options {
  amount: string;
  resource: string;
  description?: string;
  payTo?: string;
  requireResourceContext?: boolean;
}

// ── Defaults ───────────────────────────────────────────────────────────

const DEFAULT_PAY_TO =
  process.env.X402_PAY_TO ||
  process.env.X402_RECEIVER_ADDRESS ||
  '0x9fC73BE13EAB35DD55547f89b1aD2663b9038eE5';

const DEFAULT_MAX_TIMEOUT = 600; // 10 minutes

// ── 402 Challenge builder ──────────────────────────────────────────────

export function build402Challenge(
  opts: X402Options
): NextResponse<X402Challenge> {
  const challenge: X402Challenge = {
    accepts: [
      {
        scheme: 'exact',
        network: 'arc:testnet',
        asset: '0x3600000000000000000000000000000000000000', // USDC Arc Testnet
        amount: opts.amount,
        payTo: (opts.payTo || DEFAULT_PAY_TO) as `0x${string}`,
        maxTimeoutSeconds: DEFAULT_MAX_TIMEOUT,
        extra: {
          name: 'USDC',
          version: '2',
          decimals: 6,
          symbol: 'USDC',
        },
      },
    ],
    message: opts.description || `x402 payment required for ${opts.resource}`,
    resource: opts.resource,
  };

  return NextResponse.json(challenge, { status: 402 });
}

// ── Demo payment verification ──────────────────────────────────────────

interface PaymentPayload {
  x402Version?: number;
  accepted?: PaymentRequirement;
  payload?: {
    signature?: string;
    authorization?: {
      from: string;
      to: string;
      value: string;
      nonce: string;
      validAfter?: string;
      validBefore?: string;
    };
  };
}

/**
 * Parse and verify an x402 X-PAYMENT header.
 *
 * DEMO MODE: only parses and validates structure. Does NOT verify the
 * EIP-3009 signature on-chain. In production, use @x402/core's
 * `verify()` or call Circle Gateway's verification endpoint.
 */
function parsePaymentHeader(header: string): {
  ok: boolean;
  payment?: PaymentPayload;
  error?: string;
} {
  try {
    const normalized = header.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    );
    const decoded = JSON.parse(atob(padded)) as PaymentPayload;

    if (!decoded.accepted || !decoded.payload?.authorization) {
      return { ok: false, error: 'Malformed x402 payload: missing accepted or authorization' };
    }

    return { ok: true, payment: decoded };
  } catch (e) {
    return {
      ok: false,
      error: `Failed to parse X-PAYMENT header: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ── Middleware ──────────────────────────────────────────────────────────

/**
 * Higher-order function that wraps a Next.js route handler with x402
 * payment gating.
 *
 * 1. First request (no X-PAYMENT header): returns 402 challenge.
 * 2. Paid request (valid X-PAYMENT): calls the wrapped handler.
 *
 * @example
 * ```ts
 * export const GET = withX402(myHandler, {
 *   amount: '1', // 0.000001 USDC (6 decimals)
 *   resource: '/api/x402/protected-resource',
 * });
 * ```
 */
export function withX402(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  opts: X402Options
) {
  return async function x402Wrapped(req: NextRequest): Promise<NextResponse> {
    const paymentHeader = req.headers.get('X-PAYMENT');

    // No payment → return 402 challenge
    if (!paymentHeader) {
      return build402Challenge(opts);
    }

    // Parse and verify payment
    const result = parsePaymentHeader(paymentHeader);
    if (!result.ok || !result.payment) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Invalid payment' },
        { status: 402 }
      );
    }

    // DEMO: log the payment and proceed.
    // In production, replace this with real verification:
    //   const verified = await verify(result.payment, opts.amount);
    //   if (!verified) return 402 again.
    //
    // Then settle:
    //   const tx = await settle(result.payment);
    //   const txHash = tx.transactionHash;

    const txHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`;

    const response = await handler(req);

    // Attach the PAYMENT-RESPONSE header with transaction info
    const paymentResponse = btoa(
      JSON.stringify({
        transaction: txHash,
        amount: opts.amount,
        asset: '0x3600000000000000000000000000000000000000',
        timestamp: Date.now(),
      })
    );

    const nextResponse = NextResponse.json(
      { ...(await response.json()), unlocked: true, txHash },
      { status: 200 }
    );
    nextResponse.headers.set('PAYMENT-RESPONSE', paymentResponse);
    return nextResponse;
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

function atob(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

function btoa(data: string): string {
  return Buffer.from(data, 'utf-8').toString('base64');
}
