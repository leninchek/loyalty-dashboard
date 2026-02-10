'use server';

import { getSalesForReport, getSalesPaginated } from '@/lib/data';

export async function getSalesData(startDate?: number, endDate?: number) {
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  const salesData = await getSalesForReport(start, end);
  return salesData;
}

export async function getMoreSales(limit: number = 20, lastDocId?: string) {
  return await getSalesPaginated(limit, lastDocId);
}
