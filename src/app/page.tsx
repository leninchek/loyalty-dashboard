import SalesReport from '@/components/dashboard/sales-report';
import SalesTable from '@/components/dashboard/sales-table';
import KpiSection from '@/components/dashboard/kpi-section';
import TopCustomersSection from '@/components/dashboard/top-customers-section';
import UserNav from '@/components/dashboard/user-nav';
import SettingsDialog from '@/components/dashboard/settings-dialog'; // <--- IMPORTAR

export const revalidate = 300; 

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40"> {/* Agregué bg-muted/40 para darle contraste */}
      
      {/* HEADER MEJORADO */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 sm:px-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Dashboard de Loyalty App</h1>
        
        {/* GRUPO DE ACCIONES A LA DERECHA */}
        <div className="ml-auto flex items-center gap-2">
          <SettingsDialog /> {/* El engranaje */}
          <UserNav />        {/* El botón de Salir */}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
        <KpiSection />
        
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopCustomersSection />
            {/* Ya quitamos el ConfigurationPanel de aquí, queda más limpio */}
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