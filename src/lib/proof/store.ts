/**
 * Receipt store interface and in-memory implementation.
 *
 * For production, implement the ReceiptStore interface with
 * PostgreSQL, Supabase, or another persistent backend.
 */

export interface StoredReceipt {
  /** Unique receipt ID (typically the receiptHash). */
  id: string;
  /** The full receipt data. */
  data: unknown;
  /** ISO timestamp of when it was stored. */
  storedAt: string;
}

export interface ReceiptStore {
  /** Store a receipt. */
  set(id: string, receipt: unknown): Promise<void> | void;
  /** Retrieve a receipt by ID. */
  get(id: string): Promise<StoredReceipt | undefined> | StoredReceipt | undefined;
  /** List all receipts, newest first. */
  list(limit?: number): Promise<StoredReceipt[]> | StoredReceipt[];
  /** Delete a receipt. */
  delete(id: string): Promise<boolean> | boolean;
  /** Clear all receipts. */
  clear(): Promise<void> | void;
}

/**
 * In-memory receipt store (demo mode).
 *
 * Receipts are lost on process restart. Suitable for development
 * and testing only. For production, implement ReceiptStore with
 * a persistent backend (PostgreSQL, Supabase, etc.).
 */
export class InMemoryReceiptStore implements ReceiptStore {
  private store = new Map<string, StoredReceipt>();

  set(id: string, receipt: unknown): void {
    this.store.set(id, {
      id,
      data: receipt,
      storedAt: new Date().toISOString(),
    });
  }

  get(id: string): StoredReceipt | undefined {
    return this.store.get(id);
  }

  list(limit = 100): StoredReceipt[] {
    return Array.from(this.store.values())
      .sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime())
      .slice(0, limit);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
