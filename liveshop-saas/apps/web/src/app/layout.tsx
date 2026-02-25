import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'LiveShop - Live Retail Platform',
  description: 'Watch live. Tap to buy. Get it delivered in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
