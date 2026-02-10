import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { TopCustomer } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

type TopCustomersTableProps = {
  customers: TopCustomer[];
};

export default function TopCustomersTable({ customers }: TopCustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Clientes</CardTitle>
        <CardDescription>Clientes con el mayor balance de puntos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Nivel de Membresía</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.membershipLevelName}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.totalPointsBalance.toLocaleString('es-ES')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
