'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '@/lib/wagmi';

const queryClient = new QueryClient();

/**
 * Client-side providers tree.
 *
 * WagmiProvider uses the Arc Testnet config from @/lib/wagmi.
 * TanStack Query provides async state management for contract reads/writes.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
