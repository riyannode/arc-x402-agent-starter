'use client';

import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import X402StatusCard from './X402StatusCard';

/**
 * RegisterAgentCard — full agent registration flow.
 *
 * Steps:
 * 1. User enters a metadata URI for their agent.
 * 2. Pays x402 register-gate fee.
 * 3. Calls ERC-8004 registerAgent contract (or demo mode).
 * 4. Shows receipt with agentId.
 */

export default function RegisterAgentCard() {
  const [metadataURI, setMetadataURI] = useState('');
  const { step, agentId, error, progress, register, reset } =
    useAgentRegistry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadataURI.trim()) return;
    await register(metadataURI.trim());
  };

  const getStatusFromStep = () => {
    switch (step) {
      case 'idle':
        return 'idle' as const;
      case 'paying':
      case 'registering':
        return 'loading' as const;
      case 'paid':
      case 'registered':
        return 'success' as const;
      case 'error':
        return 'error' as const;
    }
  };

  return (
    <X402StatusCard
      title="Register Agent (ERC-8004)"
      status={getStatusFromStep()}
      message={progress || error}
    >
      {step === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <input
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://Qm... or https://..."
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
          />
          <p className="text-xs text-gray-500">
            Metadata URI describing your agent (e.g. IPFS CID or JSON endpoint).
          </p>
          <button
            type="submit"
            className="rounded-lg bg-arc-600 px-4 py-2 text-sm font-medium text-white hover:bg-arc-700 transition-colors"
          >
            Pay Gate & Register
          </button>
        </form>
      )}

      {step === 'registered' && agentId && (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-green-400">
            ✓ Agent registered successfully!
          </p>
          <p className="font-mono text-xs text-gray-400">
            Agent ID: {agentId}
          </p>
          <button
            onClick={reset}
            className="mt-2 text-xs text-arc-400 hover:text-arc-300"
          >
            Register another agent →
          </button>
        </div>
      )}

      {step === 'error' && (
        <button
          onClick={reset}
          className="mt-2 text-xs text-arc-400 hover:text-arc-300"
        >
          Try again →
        </button>
      )}
    </X402StatusCard>
  );
}
