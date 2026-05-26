'use client';

/**
 * Hook for job creation flow.
 *
 * Tracks state across:
 * 1. x402 create-job-gate payment
 * 2. ERC-8183 createJob contract write
 *
 * Supports demo mode (no real TX) when contract env vars are empty.
 */

import { useState, useCallback } from 'react';
import { useArcWrite } from './useArcWrite';
import { useX402Pay } from './useX402Pay';
import { addReceipt, generateTxHash } from '@/lib/receipt';
import { useAccount } from 'wagmi';
import { ZERO_ADDRESS } from '@/lib/arc';

export type JobCreationStep =
  | 'idle'
  | 'paying'
  | 'paid'
  | 'creating'
  | 'created'
  | 'error';

export interface UseJobFlowReturn {
  step: JobCreationStep;
  jobId: string | undefined;
  error: string | undefined;
  progress: string;
  /** Initiate the full job creation flow. */
  createJob: (
    provider: string,
    evaluator: string,
    expiredAt: string,
    description: string
  ) => Promise<void>;
  reset: () => void;
}

export function useJobFlow(): UseJobFlowReturn {
  const [step, setStep] = useState<JobCreationStep>('idle');
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [progress, setProgress] = useState<string>('');
  const { address } = useAccount();

  const { pay } = useX402Pay({
    resource: '/api/x402/create-job-gate',
    onProgress: setProgress,
  });

  const { isPending: isWriting, createJob, isConfirmed, txHash } = useArcWrite();

  const handleCreateJob = useCallback(
    async (
      provider: string,
      evaluator: string,
      expiredAtStr: string,
      description: string
    ) => {
      setError(undefined);
      setJobId(undefined);

      // Step 1: x402 gate payment
      setStep('paying');
      setProgress('Paying job creation gate fee…');
      const payResult = await pay();
      if (!payResult.ok) {
        setStep('error');
        setError(payResult.error || 'Payment failed');
        return;
      }
      setStep('paid');
      setProgress(`Gate paid (${payResult.amount} USDC). Creating job…`);

      // Step 2: Demo or real createJob
      const demoMode =
        !process.env.NEXT_PUBLIC_CONTRACT_AGENTIC_COMMERCE &&
        !process.env.NEXT_PUBLIC_ARC_CHAIN_ID;

      if (demoMode) {
        setStep('creating');
        await new Promise((r) => setTimeout(r, 1500));
        const demoJobId = Math.floor(Math.random() * 10000) + 1;
        setJobId(String(demoJobId));
        setStep('created');

        addReceipt({
          payer: (address || '0x0') as `0x${string}`,
          resource: '/api/x402/create-job-gate',
          amount: payResult.amount || '0',
          amountAtomic: '0',
          txHash: payResult.txHash || generateTxHash(),
          jobId: String(demoJobId),
          agentId: provider,
          payloadHash: `0x${'0'.repeat(64)}`,
          timestamp: new Date().toISOString(),
        });
        setProgress(`Job created (demo ID: ${demoJobId}).`);
        return;
      }

      // REAL: contract write
      setStep('creating');
      try {
        const providerAddr = provider as `0x${string}`;
        const evaluatorAddr = evaluator as `0x${string}`;
        const expiredAtBig = BigInt(expiredAtStr);
        await createJob(
          providerAddr,
          evaluatorAddr,
          expiredAtBig,
          description,
          ZERO_ADDRESS
        );
        // Job ID parsed from event or user provides it
        setStep('created');
        setProgress('Job created on-chain!');
      } catch (e) {
        setStep('error');
        setError(e instanceof Error ? e.message : 'Job creation failed');
      }
    },
    [pay, createJob, address]
  );

  const reset = useCallback(() => {
    setStep('idle');
    setJobId(undefined);
    setError(undefined);
    setProgress('');
  }, []);

  return {
    step,
    jobId,
    error,
    progress,
    createJob: handleCreateJob,
    reset,
  };
}
