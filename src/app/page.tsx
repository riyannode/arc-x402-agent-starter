'use client';

import X402PayButton from '@/components/X402PayButton';
import RegisterAgentCard from '@/components/RegisterAgentCard';
import CreateJobCard from '@/components/CreateJobCard';
import ProofReceiptCard from '@/components/ProofReceiptCard';
import LiveFlowTimeline from '@/components/LiveFlowTimeline';
import { useArcWallet } from '@/hooks/useArcWallet';

export default function HomePage() {
  const { isConnected, isArcChain } = useArcWallet();
  const ready = isConnected && isArcChain;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-white">
          Arc x402 Agent Starter
        </h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Build agentic commerce on Arc Network with x402 pay-per-call, 
          ERC-8004 agent identity, and ERC-8183 job escrow.
        </p>
      </div>

      {!isConnected && (
        <div className="rounded-lg border border-arc-500/30 bg-arc-500/5 p-6 text-center">
          <p className="text-gray-300 mb-2">
            Connect your wallet to get started
          </p>
          <p className="text-xs text-gray-500">
            Supports MetaMask, WalletConnect, Coinbase Wallet, and any
            EIP-1193 provider on Arc Testnet.
          </p>
        </div>
      )}

      {isConnected && !isArcChain && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-6 text-center">
          <p className="text-yellow-300">
            Please switch to Arc Testnet to interact with this starter kit.
          </p>
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column — flow steps */}
        <div className="md:col-span-2 space-y-4">
          <X402PayButton />
          <RegisterAgentCard />
          <CreateJobCard />
          <ProofReceiptCard />
        </div>

        {/* Right column — status */}
        <div className="space-y-4">
          <LiveFlowTimeline />

          {/* Quick info */}
          <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
            <h3 className="text-sm font-medium text-gray-200 mb-2">
              Arc Network
            </h3>
            <div className="space-y-1 text-xs font-mono text-gray-400">
              <p>Chain ID: 5042002</p>
              <p>Gas: USDC</p>
              <p>Finality: &lt;1s</p>
            </div>
          </div>

          {/* Docs links */}
          <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
            <h3 className="text-sm font-medium text-gray-200 mb-2">
              Resources
            </h3>
            <div className="space-y-1 text-xs">
              <a
                href="https://docs.arc.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-arc-400 hover:text-arc-300"
              >
                Arc Docs ↗
              </a>
              <a
                href="https://testnet.arcscan.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-arc-400 hover:text-arc-300"
              >
                ArcScan Explorer ↗
              </a>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-arc-400 hover:text-arc-300"
              >
                USDC Faucet ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
