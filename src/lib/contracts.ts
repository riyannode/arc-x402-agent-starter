import { CONTRACTS } from './arc';

export const CONTRACT_NAMES: Record<string, string> = {
  [CONTRACTS.ERC8004_IDENTITY_REGISTRY.toLowerCase()]:
    'ERC-8004 IdentityRegistry',
  [CONTRACTS.ERC8004_REPUTATION_REGISTRY.toLowerCase()]:
    'ERC-8004 ReputationRegistry',
  [CONTRACTS.ERC8004_VALIDATION_REGISTRY.toLowerCase()]:
    'ERC-8004 ValidationRegistry',
  [CONTRACTS.ERC8183_AGENTIC_COMMERCE.toLowerCase()]:
    'ERC-8183 AgenticCommerce',
  [CONTRACTS.USDC.toLowerCase()]: 'USDC',
};

export type ContractName = keyof typeof CONTRACT_NAMES;

export function getContractName(address: `0x${string}`): string {
  return CONTRACT_NAMES[address.toLowerCase()] || address;
}
