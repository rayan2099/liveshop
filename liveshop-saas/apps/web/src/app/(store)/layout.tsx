import { ProtectedRoute } from '@/hooks/use-auth';
import { StoreNav } from '@/components/navigation/store-nav';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['store_owner', 'store_staff', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-void">
        <StoreNav />
        <main className="pt-16">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
