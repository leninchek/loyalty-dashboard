"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";

type Sale = {
  id: string;
  customerName: string;
  totalAmount: number;
  pointsEarned: number;
  date: Timestamp;
};

export default function SalesTable() {
  const db = useFirestore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [limitCount, setLimitCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!db) {
      return;
    }

    const q = query(
      collection(db, "Purchases"),
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSales = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerName: data.customerName || "Desconocido",
          totalAmount: data.totalAmount,
          pointsEarned: data.pointsEarned,
          date: data.date,
        } as Sale;
      });

      setSales(newSales);
      setLoading(false);
      
      if (snapshot.size < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }, (error) => {
      console.error("Error listening to sales:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, limitCount]);

  const handleLoadMore = () => {
    setLimitCount((prev) => prev + 10);
  };

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Historial de Ventas</CardTitle>
        <CardDescription>Últimas transacciones registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell suppressHydrationWarning>
                      {sale.date?.toDate().toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right" suppressHydrationWarning>
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right" suppressHydrationWarning>
                      +{sale.pointsEarned.toLocaleString('es-MX')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cargar más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
