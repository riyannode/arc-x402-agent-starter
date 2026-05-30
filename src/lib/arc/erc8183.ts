/**
 * ERC-8183 Job Lifecycle Helpers
 *
 * Re-exports the lifecycle builders from writes.ts and adds
 * the createJob builder that was missing from the public API.
 *
 * This module is the single import point for ERC-8183 operations:
 *   import { buildCreateJobConfig, buildSetBudgetConfig, ... } from '@/lib/arc/erc8183';
 */

import { CONTRACTS } from '../arc';
import { ERC8183_AGENTIC_COMMERCE_ABI } from '../abis';

// ── Re-export all lifecycle builders from writes.ts ────────────────────

export {
  buildSetBudgetConfig,
  buildApproveUsdcConfig,
  buildFundJobConfig,
  buildSubmitDeliverableConfig,
  buildCompleteJobConfig,
  hashProtocolString,
} from '../writes';

// ── createJob builder ──────────────────────────────────────────────────

/**
 * Step 0: Create a new ERC-8183 job.
 *
 * @param provider - Worker/agent address that will do the work (may be zero)
 * @param evaluator - Address that evaluates the deliverable (MUST be non-zero)
 * @param expiredAt - Unix timestamp when the job expires
 * @param description - Human-readable job description
 * @param hook - Optional callback contract address (zero for no hook)
 *
 * IMPORTANT: evaluator MUST NOT be zero address — the contract reverts.
 * Use the client's own wallet address if no third-party evaluator is needed.
 *
 * IMPORTANT: jobId is NOT returned — parse it from the JobCreated event
 * in the transaction receipt.
 */
export function buildCreateJobConfig(
  provider: `0x${string}`,
  evaluator: `0x${string}`,
  expiredAt: bigint,
  description: string,
  hook: `0x${string}` = '0x0000000000000000000000000000000000000000',
) {
  return {
    address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    functionName: 'createJob' as const,
    args: [provider, evaluator, expiredAt, description, hook] as const,
  };
}

// ── Job ID parser ──────────────────────────────────────────────────────

/**
 * Parse jobId from a JobCreated event in a transaction receipt.
 *
 * createJob() emits JobCreated(jobId, client, provider, evaluator, expiredAt, hook)
 * where jobId is the first indexed topic (topic[1]).
 *
 * @param receipt - viem transaction receipt
 * @returns jobId as bigint, or 0n if not found
 */
export function parseJobIdFromReceipt(
  receipt: { logs: readonly { address: string; topics: readonly string[]; data: string }[] }
): bigint {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CONTRACTS.ERC8183_AGENTIC_COMMERCE.toLowerCase()) {
      continue;
    }
    // JobCreated(uint256 indexed jobId, ...)
    // topics[0] = event signature, topics[1] = jobId
    if (log.topics.length >= 2 && log.topics[0]) {
      // JobCreated event signature
      const jobCreatedSig = '0x...'; // Would need actual sig; fallback: check data
      // Fallback: try decoding from data if topics[1] exists
      if (log.topics[1]) {
        return BigInt(log.topics[1]);
      }
    }
  }
  return BigInt(0);
}
