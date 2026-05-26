import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import ConnectWallet from '@/components/ConnectWallet';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'arc-x402-agent-starter',
  description:
    'Minimal Next.js starter kit for Arc builders — x402 payments, agent registry, job escrow, and proof receipts on Arc Testnet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {/* Top nav */}
          <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-arc-600 flex items-center justify-center text-xs font-bold text-white">
                  A
                </span>
                <span className="text-sm font-semibold text-white">
                  arc-x402-starter
                </span>
              </div>
              <ConnectWallet />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
