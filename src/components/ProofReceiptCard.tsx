'use client';

import { useState, useEffect } from 'react';
import { useX402Pay } from '@/hooks/useX402Pay';
import X402StatusCard from './X402StatusCard';
import { getAllReceipts, type X402Receipt } from '@/lib/receipt';
import { shortenAddress, shortenHash, formatTimestamp } from '@/lib/utils';

/**
 * ProofReceiptCard — shows x402 payment + contract interaction receipts.
 *
 * After paying for premium proof unlock, this card displays the full
 * receipt with payer, resource, amount, txHash, agentId, jobId,
 * payloadHash, proofURI, and timestamp.
 */

export default function ProofReceiptCard() {
  const [receipts, setReceipts] = useState<X402Receipt[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { pay } = useX402Pay({
    resource: '/api/x402/premium-proof',
    onProgress: () => {},
  });

  useEffect(() => {
    setReceipts(getAllReceipts());
  }, []);

  const handleUnlock = async () => {
    setLoading(true);
    const result = await pay();
    setLoading(false);

    if (result.ok) {
      setUnlocked(true);
      setReceipts(getAllReceipts());
    }
  };

  const latestReceipt = receipts[0];

  return (
    <X402StatusCard
      title="Proof & Receipts"
      status={
        unlocked
          ? 'success'
          : loading
            ? 'loading'
            : receipts.length > 0
              ? 'success'
              : 'idle'
      }
      message={
        unlocked
          ? 'Premium proof unlocked!'
          : loading
            ? 'Processing…'
            : receipts.length > 0
              ? `${receipts.length} receipt(s) available`
              : undefined
      }
    >
      {!unlocked && receipts.length === 0 && (
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="mt-2 rounded-lg bg-arc-500 px-4 py-2 text-sm font-medium text-white hover:bg-arc-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : 'Pay & Unlock Premium Proof'}
        </button>
      )}

      {latestReceipt && (
        <div className="mt-3 space-y-1.5 bg-gray-950 rounded p-3 border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Latest Receipt
          </h4>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-mono">
            <span className="text-gray-500">Payer</span>
            <span className="text-gray-300">{shortenAddress(latestReceipt.payer)}</span>

            <span className="text-gray-500">Resource</span>
            <span className="text-gray-300">{latestReceipt.resource}</span>

            <span className="text-gray-500">Amount</span>
            <span className="text-gray-300">{latestReceipt.amount} USDC</span>

            <span className="text-gray-500">TxHash</span>
            <span className="text-arc-400">{shortenHash(latestReceipt.txHash)}</span>

            {latestReceipt.agentId && (
              <>
                <span className="text-gray-500">Agent ID</span>
                <span className="text-gray-300">{latestReceipt.agentId}</span>
              </>
            )}

            {latestReceipt.jobId && (
              <>
                <span className="text-gray-500">Job ID</span>
                <span className="text-gray-300">{latestReceipt.jobId}</span>
              </>
            )}

            {latestReceipt.payloadHash && (
              <>
                <span className="text-gray-500">Payload</span>
                <span className="text-gray-300">{shortenHash(latestReceipt.payloadHash)}</span>
              </>
            )}

            {latestReceipt.proofURI && (
              <>
                <span className="text-gray-500">Proof URI</span>
                <span className="text-arc-400">{latestReceipt.proofURI}</span>
              </>
            )}

            <span className="text-gray-500">Time</span>
            <span className="text-gray-300">
              {formatTimestamp(latestReceipt.timestamp, 'long')}
            </span>
          </div>
        </div>
      )}
    </X402StatusCard>
  );
}
