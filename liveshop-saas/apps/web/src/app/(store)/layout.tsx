import { ProtectedRoute } from '@/hooks/use-auth';
import { StoreNav } from '@/components/navigation/store-nav';
import { Suspense } from 'react';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['store_owner', 'store_staff', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-void">
        <Suspense fallback={<div className="h-16 bg-void animate-pulse" />}>
          <StoreNav />
        </Suspense>
        <main className="pt-16">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink mb-4" />
              <p className="text-white/40 animate-pulse">Loading dashboard components...</p>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
