import { CustomerNav } from '@/components/navigation/customer-nav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void">
      <CustomerNav />
      <main className="pt-16">{children}</main>
    </div>
  );
}
