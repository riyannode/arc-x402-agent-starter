'use client';

/**
 * Hook for agent registration flow.
 *
 * Tracks state across:
 * 1. x402 gate payment
 * 2. ERC-8004 registerAgent contract write
 *
 * Supports demo mode (no real TX) when contract env vars are empty.
 */

import { useState, useCallback, useEffect } from 'react';
import { useArcWrite } from './useArcWrite';
import { useX402Pay } from './useX402Pay';
import { addReceipt, generateTxHash } from '@/lib/receipt';
import { useAccount } from 'wagmi';

export type RegistrationStep =
  | 'idle'
  | 'paying'
  | 'paid'
  | 'registering'
  | 'registered'
  | 'error';

export interface UseAgentRegistryReturn {
  step: RegistrationStep;
  agentId: string | undefined;
  error: string | undefined;
  progress: string;
  /** Initiate the full registration flow. */
  register: (metadataURI: string) => Promise<void>;
  reset: () => void;
}

export function useAgentRegistry(): UseAgentRegistryReturn {
  const [step, setStep] = useState<RegistrationStep>('idle');
  const [agentId, setAgentId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [progress, setProgress] = useState<string>('');
  const { address } = useAccount();

  const { pay } = useX402Pay({
    resource: '/api/x402/register-gate',
    onProgress: setProgress,
  });

  const { isPending: isWriting, registerAgent, isConfirmed, txHash } = useArcWrite();

  const register = useCallback(
    async (metadataURI: string) => {
      setError(undefined);
      setAgentId(undefined);

      // Step 1: x402 gate payment
      setStep('paying');
      setProgress('Paying registration gate fee…');
      const payResult = await pay();
      if (!payResult.ok) {
        setStep('error');
        setError(payResult.error || 'Payment failed');
        return;
      }
      setStep('paid');
      setProgress(`Gate paid (${payResult.amount} USDC). Registering agent…`);

      // Step 2: Demo or real registerAgent
      const demoMode =
        !process.env.NEXT_PUBLIC_CONTRACT_IDENTITY_REGISTRY &&
        !process.env.NEXT_PUBLIC_ARC_CHAIN_ID;

      if (demoMode) {
        // DEMO: simulate registration
        setStep('registering');
        await new Promise((r) => setTimeout(r, 1500));
        const demoAgentId = Math.floor(Math.random() * 10000) + 1;
        setAgentId(String(demoAgentId));
        setStep('registered');

        addReceipt({
          payer: (address || '0x0') as `0x${string}`,
          resource: '/api/x402/register-gate',
          amount: payResult.amount || '0',
          amountAtomic: '0',
          txHash: payResult.txHash || generateTxHash(),
          agentId: String(demoAgentId),
          timestamp: new Date().toISOString(),
        });
        setProgress(`Agent registered (demo ID: ${demoAgentId}).`);
        return;
      }

      // REAL: contract write
      setStep('registering');
      try {
        await registerAgent(metadataURI);
        setStep('registered');
        setProgress('Agent registered on-chain!');
      } catch (e) {
        setStep('error');
        setError(e instanceof Error ? e.message : 'Registration failed');
      }
    },
    [pay, registerAgent, address]
  );

  // Detect confirmation from contract write
  useEffect(() => {
    if (isConfirmed && step === 'registering' && txHash) {
      setAgentId(`from-event-${txHash.slice(0, 10)}`);
      setStep('registered');
      setProgress('Agent registered on-chain!');
    }
  }, [isConfirmed, step, txHash]);

  const reset = useCallback(() => {
    setStep('idle');
    setAgentId(undefined);
    setError(undefined);
    setProgress('');
  }, []);

  return { step, agentId, error, progress, register, reset };
}
