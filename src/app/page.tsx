import { Gem, Users } from 'lucide-react';
import { getKpis, getTopCustomers } from '@/lib/data';
import KpiCard from '@/components/dashboard/kpi-card';
import TopCustomersTable from '@/components/dashboard/top-customers-table';
import SalesReport from '@/components/dashboard/sales-report';

export default async function DashboardPage() {
  const { totalCustomers, totalPointsLiability } = await getKpis();
  const topCustomers = await getTopCustomers();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-auto items-center gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Loyalty Leap Dashboard</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2">
          <KpiCard
            title="Pasivo Total de Puntos"
            value={totalPointsLiability.toLocaleString('es-ES')}
            icon={<Gem className="h-5 w-5 text-muted-foreground" />}
            description="Total de puntos que los clientes pueden canjear."
          />
          <KpiCard
            title="Total de Clientes Registrados"
            value={totalCustomers.toLocaleString('es-ES')}
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            description="Número total de clientes en el programa de lealtad."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopCustomersTable customers={topCustomers} />
          </div>
          <div>
             <SalesReport />
          </div>
        </div>
      </main>
    </div>
  );
}
