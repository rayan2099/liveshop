import { ProtectedRoute } from '@/hooks/use-auth';
import { DriverNav } from '@/components/navigation/driver-nav';
import { Suspense } from 'react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['driver', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-void">
        <Suspense fallback={<div className="h-16 bg-void animate-pulse" />}>
          <DriverNav />
        </Suspense>
        <main className="pt-16">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
