'use client';

/**
 * Hook for wallet connection state on Arc Testnet.
 *
 * Uses wagmi directly: connect via injected/MetaMask, disconnect,
 * chain switching. No Reown AppKit dependency.
 */

import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
import { ARC_CHAIN_ID } from '@/lib/arc';

export interface ArcWalletState {
  /** User's connected wallet address (EOA). */
  address: `0x${string}` | undefined;
  /** Whether a wallet is connected. */
  isConnected: boolean;
  /** Whether the wallet is on Arc Testnet. */
  isArcChain: boolean;
  /** Whether the wallet is currently connecting. */
  isConnecting: boolean;
  /** Connect using the injected provider (MetaMask, etc.). */
  connect: () => void;
  /** Switch to Arc Testnet. */
  switchToArc: () => Promise<void>;
  /** Disconnect the wallet. */
  disconnect: () => void;
}

export function useArcWallet(): ArcWalletState {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const isArcChain = chainId === ARC_CHAIN_ID;

  const connect = () => {
    // Try the first available connector (injected, metaMask, etc.)
    const connector = connectors[0];
    if (connector) {
      wagmiConnect({ connector });
    }
  };

  const switchToArc = async () => {
    await switchChainAsync({ chainId: ARC_CHAIN_ID });
  };

  const disconnect = () => {
    wagmiDisconnect();
  };

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    isArcChain,
    isConnecting,
    connect,
    switchToArc,
    disconnect,
  };
}
