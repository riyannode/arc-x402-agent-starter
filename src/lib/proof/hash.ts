/**
 * Payload hashing utilities for verifiable proofs.
 *
 * These helpers produce deterministic hashes of arbitrary payloads
 * that can be used as deliverable hashes, proof anchors, or
 * content-addressable identifiers.
 */

import { keccak256, toBytes, bytesToHex } from 'viem';

/**
 * Hash an arbitrary payload object using keccak256.
 *
 * The payload is JSON-serialized (deterministically sorted keys),
 * then hashed. This produces a bytes32 digest suitable for ERC-8183
 * deliverable/reason fields or off-chain proof verification.
 *
 * @param payload - Any JSON-serializable value
 * @returns keccak256 hash as 0x-prefixed hex string (66 chars)
 */
export function hashPayload(payload: unknown): `0x${string}` {
  const canonical = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort());
  return keccak256(toBytes(canonical));
}

/**
 * Verify that a payload matches an expected hash.
 *
 * @param payload - The original payload
 * @param expectedHash - The hash to verify against
 * @returns true if hashes match
 */
export function verifyPayloadHash(payload: unknown, expectedHash: string): boolean {
  const actual = hashPayload(payload);
  return actual.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Hash a raw string or byte content.
 *
 * For simple string hashing (e.g. description, reason text).
 * Uses keccak256 on the UTF-8 encoded bytes.
 */
export function hashString(value: string): `0x${string}` {
  return keccak256(toBytes(value.trim()));
}

/**
 * Create a content-addressable reference for a payload.
 *
 * Returns both the hash and the canonical JSON string,
 * useful for storing the proof alongside the hash.
 */
export function createContentRef(payload: unknown): {
  hash: `0x${string}`;
  canonical: string;
} {
  const keys = Object.keys(payload as Record<string, unknown>).sort();
  const canonical = JSON.stringify(payload, keys);
  const hash = keccak256(toBytes(canonical));
  return { hash, canonical };
}
