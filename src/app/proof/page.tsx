'use client';

import ProofReceiptCard from '@/components/ProofReceiptCard';

export default function ProofPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Proof & Receipts</h1>
        <p className="text-sm text-gray-400 mt-1">
          View all x402 payment receipts and proof-of-work records from your
          agent commerce interactions.
        </p>
      </div>

      <ProofReceiptCard />

      <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
        <h3 className="text-sm font-medium text-gray-200 mb-2">
          What is a receipt?
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Each receipt captures a complete x402 payment lifecycle: who paid,
          what resource was unlocked, how much USDC was charged, the on-chain
          transaction hash, and any agent/job IDs involved. Receipts are
          stored in-memory for this demo — in production, persist them to
          your backend database or send them as webhook events.
        </p>
      </div>
    </div>
  );
}
