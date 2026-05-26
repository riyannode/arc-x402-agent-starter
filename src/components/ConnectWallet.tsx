'use client';

import { useArcWallet } from '@/hooks/useArcWallet';

/**
 * ConnectWallet button using wagmi's built-in connect/disconnect.
 *
 * Shows:
 * - "Connect Wallet" when disconnected
 * - "Switch to Arc" when on wrong chain
 * - Address + chain indicator when connected
 */

export default function ConnectWallet() {
  const {
    address,
    isConnected,
    isArcChain,
    connect,
    switchToArc,
    disconnect,
  } = useArcWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="inline-flex items-center gap-2 rounded-lg bg-arc-600 px-4 py-2 text-sm font-medium text-white hover:bg-arc-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Connect Wallet
      </button>
    );
  }

  if (!isArcChain) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-yellow-400">Wrong network</span>
        <button
          onClick={switchToArc}
          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
        >
          Switch to Arc Testnet
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="text-sm text-gray-400">Arc Testnet</span>
      </span>
      <span className="font-mono text-sm text-white">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="text-xs text-gray-500 hover:text-gray-300"
      >
        Disconnect
      </button>
    </div>
  );
}
