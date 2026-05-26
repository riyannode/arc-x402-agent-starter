'use client';

/**
 * useX402Pay — client-side EIP-3009 x402 payment hook.
 *
 * Full flow:
 * 1. Switch to Arc Testnet
 * 2. Request a 402 challenge from the protected resource
 * 3. Parse accepts[] and find the USDC requirement
 * 4. Check payer's USDC balance
 * 5. Sign EIP-3009 transferWithAuthorization via eth_signTypedData_v4
 * 6. Submit X-PAYMENT header to the protected resource
 * 7. Return the result with txHash from PAYMENT-RESPONSE header
 *
 * Handles user rejection cleanly (returns error, not throws).
 */

import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { switchChain } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import {
  createPublicClient,
  formatUnits,
  getAddress,
  http,
  type Hex,
} from 'viem';
import { ARC_CHAIN_ID, USDC_ADDRESS } from '@/lib/arc';

// ── Constants ──────────────────────────────────────────────────────────

const ARC_RPC =
  process.env.NEXT_PUBLIC_ARC_RPC_URL ||
  'https://rpc.drpc.testnet.arc.network';

const BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

// ── Types ──────────────────────────────────────────────────────────────

interface Requirement {
  scheme: string;
  network: string;
  asset: `0x${string}`;
  amount: string;
  payTo: `0x${string}`;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface X402PayResult {
  ok: boolean;
  amount?: string;
  resource?: string;
  txHash?: string;
  error?: string;
}

interface UseX402PayOpts {
  /** Protected resource URL (e.g. '/api/x402/register-gate'). */
  resource: string;
  /** Optional progress callback. */
  onProgress?: (msg: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────

function randomNonce(): Hex {
  return `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as Hex;
}

function b64(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf-8').toString('base64');
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useX402Pay({ resource, onProgress }: UseX402PayOpts) {
  const { address: eoaAddress, isConnected: eoaConnected, connector } = useAccount();

  const pay = useCallback(async (): Promise<X402PayResult> => {
    if (!eoaConnected || !eoaAddress) {
      return { ok: false, error: 'Wallet not connected. Please connect first.' };
    }

    const payer = eoaAddress as `0x${string}`;
    const log = (m: string) => onProgress?.(m);

    // 1) Ensure correct chain
    try {
      await switchChain(config, { chainId: ARC_CHAIN_ID });
    } catch (e) {
      return {
        ok: false,
        error: `Failed to switch to Arc Testnet: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    // 2) Fetch 402 challenge
    log('Requesting payment challenge…');
    const challengeUrl = `${resource}?payer=${encodeURIComponent(payer)}`;
    const challengeRes = await fetch(challengeUrl);
    const challenge = await challengeRes.json().catch(() => ({}));

    if (challengeRes.status !== 402 || !Array.isArray(challenge.accepts)) {
      return {
        ok: false,
        error: `Endpoint did not return x402 challenge (status ${challengeRes.status}). It may already be unlocked.`,
      };
    }

    const accepts = challenge.accepts as Requirement[];
    const req = accepts.find(
      (a) => !a.extra?.name || a.extra?.name === 'USDC'
    ) || accepts[0];
    if (!req) return { ok: false, error: 'No payment requirement returned.' };

    const humanAmount = formatUnits(BigInt(req.amount), 6);
    log(`Fee: ${humanAmount} USDC. Checking balance…`);

    // 3) Check USDC balance
    const client = createPublicClient({ transport: http(ARC_RPC) });

    try {
      const balance = (await client.readContract({
        address: getAddress(USDC_ADDRESS),
        abi: BALANCE_ABI,
        functionName: 'balanceOf',
        args: [payer],
      })) as bigint;

      if (balance < BigInt(req.amount)) {
        return {
          ok: false,
          error: `Insufficient USDC. Need ${humanAmount} USDC, have ${formatUnits(balance, 6)} USDC.`,
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: `Failed to read USDC balance: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    // 4) Sign EIP-3009 transferWithAuthorization
    log('Sign payment authorization in your wallet…');
    const validBefore = String(Math.floor(Date.now() / 1000) + 600);
    const nonce = randomNonce();

    const paymentPayload = {
      x402Version: 2,
      accepted: {
        ...req,
        asset: getAddress(req.asset),
        payTo: getAddress(req.payTo),
        extra: { name: 'USDC', version: '2', decimals: 6, symbol: 'USDC' },
      },
      payload: {
        signature: '0x' as Hex,
        authorization: {
          from: payer,
          to: getAddress(req.payTo),
          value: req.amount,
          validAfter: '0',
          validBefore,
          nonce,
        },
      },
    };

    let signature: Hex;
    try {
      if (!connector) throw new Error('No wallet connector active.');
      const provider = (await connector.getProvider()) as {
        request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
      };
      signature = (await provider.request({
        method: 'eth_signTypedData_v4',
        params: [
          payer,
          JSON.stringify({
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' },
              ],
            },
            primaryType: 'TransferWithAuthorization',
            domain: {
              name: 'USDC',
              version: '2',
              chainId: ARC_CHAIN_ID,
              verifyingContract: getAddress(USDC_ADDRESS),
            },
            message: {
              from: payer,
              to: getAddress(req.payTo),
              value: `0x${BigInt(req.amount).toString(16)}`,
              validAfter: '0x0',
              validBefore: `0x${BigInt(validBefore).toString(16)}`,
              nonce,
            },
          }),
        ],
      })) as Hex;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/user rejected|denied|cancelled/i.test(msg)) {
        return { ok: false, error: 'Payment cancelled.' };
      }
      return { ok: false, error: `Signature failed: ${msg}` };
    }
    paymentPayload.payload.signature = signature;

    // 5) Submit payment to protected endpoint
    log('Settling payment on-chain…');
    const header = b64(paymentPayload);
    const settleRes = await fetch(resource, {
      method: 'GET',
      headers: { 'X-PAYMENT': header },
    });
    const settleJson = await settleRes.json().catch(() => ({}));

    if (!settleRes.ok || !settleJson.unlocked) {
      const reason =
        settleJson.error ||
        settleJson.reason ||
        settleJson.message ||
        `HTTP ${settleRes.status}`;
      return { ok: false, error: `Payment rejected: ${reason}` };
    }

    // 6) Extract txHash from PAYMENT-RESPONSE header
    const respHeader = settleRes.headers.get('PAYMENT-RESPONSE');
    let txHash: string | undefined;
    if (respHeader) {
      try {
        const normalized = respHeader.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(
          normalized.length + ((4 - (normalized.length % 4)) % 4),
          '='
        );
        const parsed = JSON.parse(
          Buffer.from(padded, 'base64').toString('utf-8')
        );
        txHash = parsed?.transaction || parsed?.txHash;
      } catch {
        // ignore parse errors on header
      }
    }

    return {
      ok: true,
      txHash: txHash || settleJson.txHash,
      amount: humanAmount,
      resource,
    };
  }, [eoaConnected, eoaAddress, connector, resource, onProgress]);

  return { pay };
}
