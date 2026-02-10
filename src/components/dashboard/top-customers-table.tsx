import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { Customer } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

type TopCustomersTableProps = {
  customers: Customer[];
};

function getContrastColor(hexColor: string) {
    if (!hexColor) return '#000000';
    if (hexColor.slice(0, 1) === '#') {
        hexColor = hexColor.slice(1);
    }
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

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
                      <Badge style={{ 
                        backgroundColor: customer.membershipLevelColor,
                        color: getContrastColor(customer.membershipLevelColor) 
                      }}>
                        {customer.membershipLevelName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" suppressHydrationWarning>
                      {customer.totalPointsBalance.toLocaleString('es-MX')}
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
