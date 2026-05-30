/**
 * Default agent manifest for the starter kit.
 *
 * Used by the .well-known/arclayer-agent.json route.
 * Fork this file to customize your own agent's manifest.
 */

import type { AgentManifest } from './schema';
import { CONTRACTS, USDC_ADDRESS } from '../arc';

export const defaultManifest: AgentManifest = {
  schema: 'arclayer.agent/v1',
  version: '0.1.0',
  name: 'Arc x402 Agent Starter',
  description:
    'Forkable starter kit for building paid AI-agent APIs on Arc Testnet using x402, ERC-8004, and ERC-8183.',
  endpoint: 'http://localhost:3000',
  owner: 'arclayer',
  mode: 'seller',
  categories: ['ai', 'agent', 'starter'],
  capabilities: [
    'x402-pay-per-call',
    'erc8004-agent-identity',
    'erc8183-job-escrow',
    'proof-receipts',
  ],
  roles: ['provider', 'evaluator'],
  x402: {
    scheme: 'exact',
    network: 'arc:testnet',
    asset: USDC_ADDRESS,
    payTo: '0x9fC73BE13EAB35DD55547f89b1aD2663b9038eE5',
    maxTimeoutSeconds: 600,
  },
  jobs: {
    enabled: true,
    contract: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
    steps: ['createJob', 'setBudget', 'approve', 'fund', 'submit', 'complete'],
  },
  proof: {
    enabled: true,
    hashAlgorithm: 'keccak256',
    store: 'memory',
  },
};
