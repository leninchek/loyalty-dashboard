import SalesReport from '@/components/dashboard/sales-report';
import SalesTable from '@/components/dashboard/sales-table';
import KpiSection from '@/components/dashboard/kpi-section';
import TopCustomersSection from '@/components/dashboard/top-customers-section';
import UserNav from '@/components/dashboard/user-nav';

export const revalidate = 300; // Revalidate every 5 minutes

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-auto items-center gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard de Loyalty App</h1>
        <UserNav />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
        <KpiSection />
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopCustomersSection />
          </div>
          <div>
             <SalesReport />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <SalesTable />
        </div>
      </main>
    </div>
  );
}
