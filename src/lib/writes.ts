/**
 * ERC-8183 Job Lifecycle Config Builders
 *
 * Each function returns a wagmi-compatible write config object
 * { address, abi, functionName, args } for a specific lifecycle step.
 *
 * Use with useWriteContract or useArcWrite:
 *   const hash = await writeContractAsync(buildSetBudgetConfig(jobId, amount));
 *
 * Source: https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job.md
 */

import { keccak256, toBytes } from 'viem';
import {
  ERC8183_AGENTIC_COMMERCE_ABI,
  USDC_ABI,
} from './abis';
import { CONTRACTS, ZERO_ADDRESS } from './arc';

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Deterministic keccak256 hash of a trimmed string.
 * Used for deliverable and reason hashes in ERC-8183.
 */
export function hashProtocolString(value: string): `0x${string}` {
  return keccak256(toBytes(value.trim()));
}

// ── ERC-8183 Lifecycle Builders ────────────────────────────────────────

/**
 * Step 1: Set budget for a created job.
 * Call AFTER createJob returns a jobId.
 */
export function buildSetBudgetConfig(
  jobId: bigint,
  amount: bigint,
  optParams: `0x${string}` = '0x',
) {
  return {
    address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    functionName: 'setBudget' as const,
    args: [jobId, amount, optParams] as const,
  };
}

/**
 * Step 2: Approve USDC for the AgenticCommerce contract to spend.
 * Call BEFORE fund(). Amount should match the budget.
 *
 * CRITICAL: USDC on Arc uses 6 decimals (ERC-20 interface).
 *   10 USDC = BigInt(10 * 10**6) = 10_000000n
 */
export function buildApproveUsdcConfig(amount: bigint) {
  return {
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'approve' as const,
    args: [CONTRACTS.ERC8183_AGENTIC_COMMERCE, amount] as const,
  };
}

/**
 * Step 3: Fund the job with escrow.
 * Call AFTER approve() is confirmed.
 */
export function buildFundJobConfig(
  jobId: bigint,
  optParams: `0x${string}` = '0x',
) {
  return {
    address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    functionName: 'fund' as const,
    args: [jobId, optParams] as const,
  };
}

/**
 * Step 4: Submit deliverable (worker side).
 * Accepts either a raw bytes32 hash or a string to hash.
 *
 * If deliverable is a 66-char hex string (0x + 64 hex), it's used as-is.
 * Otherwise, it's hashed via hashProtocolString().
 */
export function buildSubmitDeliverableConfig(
  jobId: bigint,
  deliverable: `0x${string}` | string,
  optParams: `0x${string}` = '0x',
) {
  const deliverableHash =
    deliverable.startsWith('0x') && deliverable.length === 66
      ? (deliverable as `0x${string}`)
      : hashProtocolString(deliverable);

  return {
    address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    functionName: 'submit' as const,
    args: [jobId, deliverableHash, optParams] as const,
  };
}

/**
 * Step 5: Complete the job (client/evaluator side).
 * Triggers USDC settlement from escrow to worker.
 *
 * Reason is bytes32; strings are hashed automatically.
 */
export function buildCompleteJobConfig(
  jobId: bigint,
  reason: `0x${string}` | string = 'approved',
  optParams: `0x${string}` = '0x',
) {
  const reasonHash =
    reason.startsWith('0x') && reason.length === 66
      ? (reason as `0x${string}`)
      : hashProtocolString(reason);

  return {
    address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    functionName: 'complete' as const,
    args: [jobId, reasonHash, optParams] as const,
  };
}
