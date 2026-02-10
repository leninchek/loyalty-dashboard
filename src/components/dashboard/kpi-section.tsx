"use client";

import { useState, useEffect } from "react";
import { Gem, Users } from "lucide-react";
import KpiCard from "@/components/dashboard/kpi-card";
import { useFirestore } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";

export default function KpiSection() {
  const db = useFirestore();
  const [stats, setStats] = useState({ totalCustomers: 0, totalPointsLiability: 0 });
  const [pointValue, setPointValue] = useState(0);

  useEffect(() => {
    if (!db) return;

    // Subscribe to Stats
    const unsubStats = onSnapshot(doc(db, "Stats", "general"), (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as any);
      }
    });

    // Subscribe to Configuration
    const unsubConfig = onSnapshot(doc(db, "Configuration", "general"), (doc) => {
      if (doc.exists()) {
        setPointValue(doc.data()?.pointValue || 0);
      }
    });

    return () => {
      unsubStats();
      unsubConfig();
    };
  }, [db]);

  const totalLiabilityValue = stats.totalPointsLiability * pointValue;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <KpiCard
        title="Total de Puntos sin Redimir"
        value={<span suppressHydrationWarning>{stats.totalPointsLiability.toLocaleString("es-MX")}</span>}
        icon={<Gem className="h-5 w-5 text-muted-foreground" />}
        description={
          <span suppressHydrationWarning>
            {`Equivalente a ${totalLiabilityValue.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}`}
          </span>
        }
      />
      <KpiCard
        title="Total de Clientes Registrados"
        value={<span suppressHydrationWarning>{stats.totalCustomers.toLocaleString("es-MX")}</span>}
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
        description="Número total de clientes en el programa de lealtad."
      />
    </div>
  );
}