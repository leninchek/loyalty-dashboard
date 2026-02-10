"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getSalesData } from "@/app/actions";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SalesReport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const salesData = await getSalesData();

      if (salesData.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay datos de ventas para generar el reporte.",
        });
        return;
      }
      
      const formattedData = salesData.map(purchase => ({
        "ID Compra": purchase.id,
        "ID Cliente": purchase.customerId,
        "Monto Total": purchase.totalAmount,
        "Puntos Ganados": purchase.pointsEarned,
        "Fecha": new Date(purchase.date.seconds * 1000).toISOString().split('T')[0],
      }));

      const csv = Papa.unparse(formattedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const formattedDate = new Date().toISOString().split('T')[0];

      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_de_ventas_${formattedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast({
          title: "Error",
          description: "Hubo un error al generar el reporte. Por favor, intente de nuevo.",
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reportes</CardTitle>
        <CardDescription>Descarga los datos de la plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownload} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Generando..." : "Descargar Reporte de Ventas"}
        </Button>
      </CardContent>
    </Card>
  );
}
