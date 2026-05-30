/**
 * ERC-8004 Agent Identity helpers.
 *
 * Build wagmi-compatible write configs for registering AI agents
 * on the Arc Testnet IdentityRegistry contract.
 *
 * Source: https://docs.arc.io/arc/tutorials/register-your-first-ai-agent.md
 */

import { CONTRACTS } from '../arc';
import { ERC8004_IDENTITY_REGISTRY_ABI } from '../abis';

// ── Types ──────────────────────────────────────────────────────────────

export interface AgentMetadataInput {
  /** Human-readable agent name. */
  name: string;
  /** Short description of the agent's purpose. */
  description: string;
  /** Agent API endpoint URL. */
  endpoint: string;
  /** Agent version (semver). */
  version?: string;
  /** Capabilities this agent offers. */
  capabilities?: string[];
  /** Roles this agent can play (e.g. "provider", "evaluator"). */
  roles?: string[];
  /** Owner identifier. */
  owner?: string;
}

export interface AgentMetadata {
  schema: 'arclayer.agent-metadata/v1';
  name: string;
  description: string;
  endpoint: string;
  version: string;
  capabilities: string[];
  roles: string[];
  owner: string;
  registeredAt: string;
}

// ── Builders ───────────────────────────────────────────────────────────

/**
 * Build a metadata JSON object for agent registration.
 * This is the off-chain metadata that gets stored at a URI
 * and referenced by the on-chain tokenId.
 */
export function buildAgentMetadata(input: AgentMetadataInput): AgentMetadata {
  return {
    schema: 'arclayer.agent-metadata/v1',
    name: input.name,
    description: input.description,
    endpoint: input.endpoint,
    version: input.version ?? '0.1.0',
    capabilities: input.capabilities ?? [],
    roles: input.roles ?? ['provider'],
    owner: input.owner ?? '',
    registeredAt: new Date().toISOString(),
  };
}

/**
 * Validate agent metadata input. Returns an array of error strings.
 * Empty array = valid.
 */
export function validateAgentMetadata(input: unknown): string[] {
  const errors: string[] = [];
  const obj = input as Record<string, unknown>;

  if (!obj || typeof obj !== 'object') return ['Input must be an object'];
  if (!obj.name || typeof obj.name !== 'string') errors.push('name is required (string)');
  if (!obj.description || typeof obj.description !== 'string')
    errors.push('description is required (string)');
  if (!obj.endpoint || typeof obj.endpoint !== 'string')
    errors.push('endpoint is required (string)');

  return errors;
}

/**
 * Build a wagmi write config for registering an agent on ERC-8004.
 *
 * @param metadataURI - URI pointing to the agent's metadata JSON
 *   (e.g. "ipfs://Qm...", "https://your-agent.com/metadata.json", or
 *    "data:application/json;base64,..." for demo mode).
 *
 * @example
 * ```ts
 * const config = buildRegisterAgentConfig('https://my-agent.com/meta.json');
 * const hash = await writeContractAsync(config);
 * ```
 */
export function buildRegisterAgentConfig(metadataURI: string) {
  return {
    address: CONTRACTS.ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_IDENTITY_REGISTRY_ABI,
    functionName: 'register' as const,
    args: [metadataURI] as const,
  };
}

/**
 * Parse the agent tokenId (agentId) from a Transfer event receipt.
 *
 * ERC-8004's register() mints an NFT. The tokenId IS the agentId.
 * The Transfer event is emitted with tokenId as the third indexed topic.
 *
 * @param receipt - viem transaction receipt
 * @returns tokenId as bigint, or 0n if not found
 */
export function parseAgentIdFromTransferReceipt(
  receipt: { logs: readonly { address: string; topics: readonly string[] }[] }
): bigint {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CONTRACTS.ERC8004_IDENTITY_REGISTRY.toLowerCase()) {
      continue;
    }
    // Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    // topics[0] = event signature
    // topics[1] = from (zero for mint)
    // topics[2] = to
    // topics[3] = tokenId
    if (log.topics.length >= 4 && log.topics[0]) {
      // Transfer event signature
      const transferSig = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      if (log.topics[0].toLowerCase() === transferSig) {
        return BigInt(log.topics[3] as string);
      }
    }
  }
  return BigInt(0);
}
