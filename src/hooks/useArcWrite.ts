'use client';

/**
 * Hook for writing to Arc network contracts via wagmi's useWriteContract.
 *
 * Provides type-safe config builders for ERC-8004 registerAgent and
 * ERC-8183 createJob, mirroring the ArcLayer SDK patterns without
 * depending on the monorepo.
 */

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type BaseError } from 'viem';
import { CONTRACTS, ZERO_ADDRESS } from '@/lib/arc';
import { ERC8004_IDENTITY_REGISTRY_ABI, ERC8183_AGENTIC_COMMERCE_ABI } from '@/lib/abis';

export interface ArcWriteResult {
  /** Whether the write transaction was submitted. */
  isPending: boolean;
  /** Transaction hash once submitted. */
  txHash: `0x${string}` | undefined;
  /** Whether the transaction has confirmed. */
  isConfirmed: boolean;
  /** Error message if the write failed. */
  error: string | undefined;
  /** Write a registerAgent transaction. */
  registerAgent: (metadataURI: string) => Promise<void>;
  /** Write a createJob transaction. */
  createJob: (
    provider: `0x${string}`,
    evaluator: `0x${string}`,
    expiredAt: bigint,
    description: string,
    hook?: `0x${string}`
  ) => Promise<void>;
  /** Reset error and tx state. */
  reset: () => void;
}

export function useArcWrite(): ArcWriteResult {
  const {
    writeContractAsync,
    isPending,
    data: txHash,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const registerAgent = async (metadataURI: string) => {
    await writeContractAsync({
      address: CONTRACTS.ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_IDENTITY_REGISTRY_ABI,
      functionName: 'register',
      args: [metadataURI],
    });
  };

  const createJob = async (
    provider: `0x${string}`,
    evaluator: `0x${string}`,
    expiredAt: bigint,
    description: string,
    hook: `0x${string}` = ZERO_ADDRESS
  ) => {
    await writeContractAsync({
      address: CONTRACTS.ERC8183_AGENTIC_COMMERCE,
      abi: ERC8183_AGENTIC_COMMERCE_ABI,
      functionName: 'createJob',
      args: [provider, evaluator, expiredAt, description, hook],
    });
  };

  return {
    isPending,
    txHash,
    isConfirmed,
    error: writeError
      ? (writeError as BaseError).shortMessage || writeError.message
      : undefined,
    registerAgent,
    createJob,
    reset,
  };
}
