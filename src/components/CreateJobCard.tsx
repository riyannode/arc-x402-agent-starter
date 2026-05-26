'use client';

import { useState } from 'react';
import { useJobFlow } from '@/hooks/useJobFlow';
import X402StatusCard from './X402StatusCard';
import { ZERO_ADDRESS } from '@/lib/arc';

/**
 * CreateJobCard — full job creation flow.
 *
 * Steps:
 * 1. User fills provider (agent address), evaluator, expiry, description.
 * 2. Pays x402 create-job-gate fee.
 * 3. Calls ERC-8183 createJob contract (or demo mode).
 * 4. Shows receipt with jobId.
 */

export default function CreateJobCard() {
  const [provider, setProvider] = useState('');
  const [evaluator, setEvaluator] = useState('');
  const [expiredAt, setExpiredAt] = useState('');
  const [description, setDescription] = useState('');

  const { step, jobId, error, progress, createJob, reset } = useJobFlow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim() || !description.trim()) return;
    const expiredAtVal = expiredAt.trim() || '0';
    await createJob(
      provider.trim() || ZERO_ADDRESS,
      evaluator.trim() || ZERO_ADDRESS,
      expiredAtVal,
      description.trim()
    );
  };

  const getStatusFromStep = () => {
    switch (step) {
      case 'idle':
        return 'idle' as const;
      case 'paying':
      case 'creating':
        return 'loading' as const;
      case 'paid':
      case 'created':
        return 'success' as const;
      case 'error':
        return 'error' as const;
    }
  };

  return (
    <X402StatusCard
      title="Create Job (ERC-8183)"
      status={getStatusFromStep()}
      message={progress || error}
    >
      {step === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Provider address (0x...)"
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
          />
          <input
            type="text"
            value={evaluator}
            onChange={(e) => setEvaluator(e.target.value)}
            placeholder="Evaluator address (0x...) — optional"
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
          />
          <input
            type="text"
            value={expiredAt}
            onChange={(e) => setExpiredAt(e.target.value)}
            placeholder="Expiry (unix timestamp) — 0 for no expiry"
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job description..."
            rows={2}
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-arc-600 px-4 py-2 text-sm font-medium text-white hover:bg-arc-700 transition-colors"
          >
            Pay Gate & Create Job
          </button>
        </form>
      )}

      {step === 'created' && jobId && (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-green-400">
            ✓ Job created successfully!
          </p>
          <p className="font-mono text-xs text-gray-400">
            Job ID: {jobId}
          </p>
          <button
            onClick={reset}
            className="mt-2 text-xs text-arc-400 hover:text-arc-300"
          >
            Create another job →
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
