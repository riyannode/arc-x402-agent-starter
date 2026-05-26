/**
 * General utility helpers for the starter kit.
 */

/** Shorten an Ethereum address for display. */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Shorten a transaction hash for display. */
export function shortenHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/** Format a bigint amount as a human-readable USDC string (6 decimals). */
export function formatUsdcAmount(atomic: bigint | string): string {
  const bn = typeof atomic === 'string' ? BigInt(atomic) : atomic;
  const whole = bn / BigInt(1_000_000);
  const frac = bn % BigInt(1_000_000);
  return `${whole.toLocaleString()}.${frac.toString().padStart(6, '0').slice(0, 2)}`;
}

/** Convert a human-readable USDC string to atomic units (6 decimals). */
export function parseUsdcAmount(amount: string): bigint {
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(6, '0').slice(0, 6);
  return BigInt(whole + frac);
}

/** AbortError-compatible timeout helper. */
export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
}

/** Check if running in a browser environment. */
export const isBrowser = typeof window !== 'undefined';

/** Format a Date or ISO string to a readable local time. */
export function formatTimestamp(
  ts: string | Date | number,
  style: 'short' | 'long' = 'short'
): string {
  const d = typeof ts === 'string' || typeof ts === 'number' ? new Date(ts) : ts;
  return style === 'short'
    ? d.toLocaleTimeString()
    : d.toLocaleString();
}
