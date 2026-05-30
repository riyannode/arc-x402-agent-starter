/**
 * Proof module — payload hashing, work receipts, and receipt stores.
 *
 * Usage:
 *   import { hashPayload, buildWorkReceipt, InMemoryReceiptStore } from '@/lib/proof';
 */

export { hashPayload, verifyPayloadHash, hashString, createContentRef } from './hash';
export { buildWorkReceipt, verifyWorkReceipt } from './receipt';
export type { WorkReceipt, WorkReceiptInput } from './receipt';
export { InMemoryReceiptStore, type ReceiptStore, type StoredReceipt } from './store';
