import { ProtectedRoute } from '@/hooks/use-auth';
import { DriverNav } from '@/components/navigation/driver-nav';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['driver', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-void">
        <DriverNav />
        <main className="pt-16">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
