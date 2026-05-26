'use client';

/**
 * Wagmi configuration for Arc Testnet.
 *
 * Uses wagmi's built-in createConfig with a simple http transport.
 * No Reown AppKit dependency — wallet connection is handled via
 * wagmi's built-in `useConnect` + injected/metamask connectors.
 *
 * For a production wallet modal, wrap with Reown AppKit or RainbowKit.
 */

import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';
import { ARC_CHAIN_ID, ARC_RPC_URLS, ARC_EXPLORER } from './arc';

/** Arc Testnet as a viem chain. */
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ARC_RPC_URLS },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: ARC_EXPLORER },
  },
  testnet: true,
});

/** Wagmi config — supports injected (MetaMask, Brave, etc.) and MetaMask connector. */
export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [ARC_CHAIN_ID]: http(ARC_RPC_URLS[0]),
  },
  connectors: [injected(), metaMask()],
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
