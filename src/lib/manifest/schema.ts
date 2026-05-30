/**
 * Agent Manifest schema — ArcLayer convention for agent self-advertisement.
 *
 * An agent manifest describes an agent runtime's identity, capabilities,
 * payment config, and supported job lifecycle. External builders can fetch
 * /.well-known/arclayer-agent.json to discover and integrate with an agent.
 *
 * This is an ArcLayer community convention, not an official Arc/Circle standard.
 */

export interface AgentManifestX402 {
  /** Payment scheme: "exact" (EIP-3009) or "gateway" (Circle Gateway). */
  scheme: string;
  /** Network identifier: "arc:testnet" or "arc:mainnet". */
  network: string;
  /** USDC token address (0x3600...0000 on Arc Testnet). */
  asset: string;
  /** Receiver wallet address. */
  payTo: string;
  /** Seconds before a payment challenge expires. */
  maxTimeoutSeconds: number;
}

export interface AgentManifestJobs {
  /** Whether this agent can create ERC-8183 jobs. */
  enabled: boolean;
  /** AgenticCommerce contract address. */
  contract?: string;
  /** Supported lifecycle steps. */
  steps?: string[];
}

export interface AgentManifestProof {
  /** Whether this agent produces verifiable receipts. */
  enabled: boolean;
  /** Hash algorithm used for payload proofs (e.g. "keccak256"). */
  hashAlgorithm?: string;
  /** Where receipts are stored: "memory", "supabase", "ipfs", etc. */
  store?: string;
}

export interface AgentManifest {
  /** Schema identifier — always "arclayer.agent/v1". */
  schema: string;
  /** Semver of this manifest. */
  version: string;
  /** Human-readable agent name. */
  name: string;
  /** Short description of what this agent does. */
  description: string;
  /** Base URL where this agent's API is reachable. */
  endpoint: string;
  /** Owner identifier (ENS, email, or org name). */
  owner: string;
  /** Whether this agent sells services, buys them, or both. */
  mode: 'seller' | 'buyer' | 'dual';
  /** Discovery categories (e.g. ["ai", "oracle", "data"]). */
  categories: string[];
  /** Specific capabilities this agent offers. */
  capabilities: string[];
  /** Roles this agent can play in the event graph. */
  roles: string[];
  /** x402 payment configuration. */
  x402: AgentManifestX402;
  /** ERC-8183 job configuration. */
  jobs: AgentManifestJobs;
  /** Proof and receipt configuration. */
  proof: AgentManifestProof;
}
