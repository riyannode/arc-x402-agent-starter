/**
 * x402 receipt types and helpers.
 *
 * After a successful x402 payment + agent/job operation, a receipt
 * captures the full provenance: who paid, what they got, and the
 * on-chain transaction that settled it.
 */

export interface X402Receipt {
  /** Wallet address that paid. */
  payer: `0x${string}`;
  /** The protected resource that was paid for. */
  resource: string;
  /** Human-readable amount paid (e.g. "0.000001 USDC"). */
  amount: string;
  /** Atomic amount (6-decimal USDC). */
  amountAtomic: string;
  /** On-chain transaction hash of the settlement. */
  txHash: string;
  /** Agent ID (ERC-8004 tokenId), if applicable. */
  agentId?: string;
  /** Job ID (ERC-8183), if applicable. */
  jobId?: string;
  /** Hash of the work payload (keccak256 of deliverable content). */
  payloadHash?: string;
  /** URI pointing to the proof of work (IPFS, Arweave, etc.). */
  proofURI?: string;
  /** ISO timestamp of when the receipt was created. */
  timestamp: string;
}

export interface ReceiptStore {
  [txHash: string]: X402Receipt;
}

// In-memory receipt store (demo). Replace with IndexedDB / localStorage
// or a backend database in production.
let receipts: ReceiptStore = {};

export function addReceipt(receipt: X402Receipt): void {
  receipts[receipt.txHash] = receipt;
}

export function getReceipt(txHash: string): X402Receipt | undefined {
  return receipts[txHash];
}

export function getAllReceipts(): X402Receipt[] {
  return Object.values(receipts).sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function clearReceipts(): void {
  receipts = {};
}

export function generateTxHash(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}
