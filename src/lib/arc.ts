// ── Arc Testnet chain constants ──────────────────────────────────────────
export const ARC_CHAIN_ID = 5042002;
export const ARC_EXPLORER = 'https://testnet.arcscan.app';
export const ARC_RPC_URLS = [
  'https://rpc.drpc.testnet.arc.network',
  'https://rpc.testnet.arc.network',
] as const;

export const ARC_NATIVE_USDC_DECIMALS = 18;
export const ARC_ERC20_USDC_DECIMALS = 6;
export const ARC_CCTP_DOMAIN = 26;

/** ERC-20 USDC address on Arc Testnet (6 decimals). */
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

export const TOKENS = {
  USDC: USDC_ADDRESS,
  EURC: EURC_ADDRESS,
} as const;

/** Official Arc reference contract addresses. */
export const CONTRACTS = {
  /** ERC-8004 IdentityRegistry — register AI agents. */
  ERC8004_IDENTITY_REGISTRY: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  /** ERC-8004 ReputationRegistry — give feedback on agent work. */
  ERC8004_REPUTATION_REGISTRY: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
  /** ERC-8004 ValidationRegistry — request/respond validation. */
  ERC8004_VALIDATION_REGISTRY: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272',
  /** ERC-8183 AgenticCommerce — create/fund/complete jobs. */
  ERC8183_AGENTIC_COMMERCE: '0x0747EEf0706327138c69792bF28Cd525089e4583',
  USDC: USDC_ADDRESS,
} as const;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/** Ethereum-native USDC decimals (18 for Arc's native gas token interface). */
export function formatArcAmount(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6);
}

/** ERC-20 USDC decimals (6 for the token contract). */
export function formatUsdc(atomic: bigint): string {
  return (Number(atomic) / 1e6).toFixed(6);
}

/** Convert USDC decimal string to atomic (6 decimals). */
export function parseUsdc(amount: string): bigint {
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(6, '0').slice(0, 6);
  return BigInt(whole + frac);
}
