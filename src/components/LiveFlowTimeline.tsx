'use client';

import { useArcWallet } from '@/hooks/useArcWallet';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useJobFlow } from '@/hooks/useJobFlow';

/**
 * LiveFlowTimeline — visual timeline of the full x402 agent commerce flow.
 *
 * Steps:
 * 1. Wallet connected
 * 2. x402 paid
 * 3. Agent registered
 * 4. Job created
 * 5. Proof unlocked
 * 6. Receipt ready
 */

interface TimelineStep {
  label: string;
  key: string;
  done: boolean;
  active: boolean;
}

export default function LiveFlowTimeline() {
  const { isConnected, isArcChain } = useArcWallet();
  const { step: regStep } = useAgentRegistry();
  const { step: jobStep } = useJobFlow();

  const walletConnected = isConnected && isArcChain;
  const x402Paid =
    regStep === 'paid' ||
    regStep === 'registered' ||
    jobStep === 'paid' ||
    jobStep === 'created';
  const agentRegistered = regStep === 'registered';
  const jobCreated = jobStep === 'created';

  // If we have receipts or proof unlocked
  const proofUnlocked = false;
  const receiptReady = regStep === 'registered' || jobStep === 'created';

  const steps: TimelineStep[] = [
    { label: 'Wallet Connected', key: 'wallet', done: walletConnected, active: walletConnected && !x402Paid },
    { label: 'x402 Paid', key: 'x402', done: x402Paid, active: x402Paid && !agentRegistered },
    { label: 'Agent Registered', key: 'register', done: agentRegistered, active: agentRegistered && !jobCreated },
    { label: 'Job Created', key: 'job', done: jobCreated, active: jobCreated && !proofUnlocked },
    { label: 'Proof Unlocked', key: 'proof', done: proofUnlocked, active: proofUnlocked && !receiptReady },
    { label: 'Receipt Ready', key: 'receipt', done: receiptReady, active: receiptReady && !proofUnlocked },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-200">
          Agent Commerce Flow
        </h3>
        <span className="text-xs text-gray-500">
          {completedCount}/{totalSteps} steps
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-arc-500 to-green-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  step.done
                    ? 'bg-green-500 border-green-500'
                    : step.active
                      ? 'bg-arc-500 border-arc-500 animate-pulse'
                      : 'bg-gray-800 border-gray-600'
                }`}
              />
              {i < totalSteps - 1 && (
                <div
                  className={`w-0.5 h-5 ${
                    step.done ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs ${
                step.done
                  ? 'text-green-400'
                  : step.active
                    ? 'text-arc-300'
                    : 'text-gray-500'
              }`}
            >
              {step.done && '✓ '}
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
