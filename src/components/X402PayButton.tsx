'use client';

import { useState } from 'react';
import { useX402Pay } from '@/hooks/useX402Pay';

/**
 * X402PayButton — one-click x402 payment button.
 *
 * This is a standalone demo button for testing the protected-resource endpoint.
 * It performs the full EIP-3009 payment flow:
 *   switch chain → fetch challenge → check balance → sign → submit
 */

interface X402PayButtonProps {
  resource?: string;
  label?: string;
  onComplete?: (result: { ok: boolean; txHash?: string; amount?: string }) => void;
}

export default function X402PayButton({
  resource = '/api/x402/protected-resource',
  label = 'Unlock with x402',
  onComplete,
}: X402PayButtonProps) {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { pay } = useX402Pay({
    resource,
    onProgress: (msg) => setStatus(msg),
  });

  const handlePay = async () => {
    setLoading(true);
    setStatus('Starting payment…');
    const result = await pay();
    setLoading(false);

    if (result.ok) {
      setStatus(`✓ Paid ${result.amount} USDC. Tx: ${result.txHash?.slice(0, 16)}…`);
      onComplete?.(result);
    } else {
      setStatus(`✗ ${result.error}`);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          loading
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-arc-500 hover:bg-arc-600 text-white'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </>
        ) : (
          label
        )}
      </button>
      {status && (
        <p className="text-xs text-gray-400 font-mono">{status}</p>
      )}
    </div>
  );
}
