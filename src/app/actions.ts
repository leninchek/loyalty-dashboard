'use server';

import { getSalesForReport } from '@/lib/data';

export async function getSalesData() {
  const salesData = await getSalesForReport();
  return salesData;
}
