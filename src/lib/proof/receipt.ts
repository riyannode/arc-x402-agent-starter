/**
 * Work receipt builder for verifiable proofs.
 *
 * A WorkReceipt captures the full provenance of a completed job:
 * who did the work, what they produced, and how to verify it.
 */

import { hashPayload } from './hash';

export interface WorkReceiptInput {
  /** Job ID from ERC-8183. */
  jobId: string;
  /** Address of the worker/agent that produced the deliverable. */
  worker: string;
  /** Address of the client who requested the work. */
  client: string;
  /** The actual deliverable payload (any JSON-serializable value). */
  deliverable: unknown;
  /** Optional context or metadata. */
  context?: Record<string, unknown>;
}

export interface WorkReceipt {
  /** Receipt schema version. */
  schema: 'arclayer.work-receipt/v1';
  /** Job ID from ERC-8183. */
  jobId: string;
  /** Worker address. */
  worker: string;
  /** Client address. */
  client: string;
  /** keccak256 hash of the deliverable. */
  deliverableHash: string;
  /** The original deliverable content (for off-chain verification). */
  deliverable: unknown;
  /** Optional context. */
  context?: Record<string, unknown>;
  /** ISO timestamp. */
  timestamp: string;
  /** Combined hash of the entire receipt (for integrity checks). */
  receiptHash: string;
}

/**
 * Build a WorkReceipt from a completed job's data.
 *
 * The receipt includes both the deliverable content and a
 * deterministic hash of the full receipt object, enabling
 * both content verification and integrity checks.
 */
export function buildWorkReceipt(input: WorkReceiptInput): WorkReceipt {
  const deliverableHash = hashPayload(input.deliverable);

  const receipt: WorkReceipt = {
    schema: 'arclayer.work-receipt/v1',
    jobId: input.jobId,
    worker: input.worker,
    client: input.client,
    deliverableHash,
    deliverable: input.deliverable,
    context: input.context,
    timestamp: new Date().toISOString(),
    receiptHash: '', // computed below
  };

  // Compute receipt hash over all fields except receiptHash itself
  const { receiptHash: _, ...hashable } = receipt;
  receipt.receiptHash = hashPayload(hashable);

  return receipt;
}

/**
 * Verify a WorkReceipt's integrity.
 *
 * Recomputes the receiptHash from the receipt's other fields
 * and checks it matches the stored value.
 */
export function verifyWorkReceipt(receipt: WorkReceipt): boolean {
  const { receiptHash: stored, ...hashable } = receipt;
  const computed = hashPayload(hashable);
  return computed.toLowerCase() === stored.toLowerCase();
}
