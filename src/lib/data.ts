import 'server-only';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, type Timestamp } from 'firebase/firestore';

// Data shapes based on user's description
export interface Customer {
  id: string;
  name: string;
  totalPointsBalance: number;
  membershipLevelId: string;
  membershipLevelName: string;
  membershipLevelColor: string;
}

export interface MembershipType {
  id: string;
  name: string;
  rewardRate: number;
  color: string;
}

export interface Purchase {
  id: string;
  customerId: string;
  totalAmount: number;
  pointsEarned: number;
  date: Timestamp;
}

// Fetches KPI data
export async function getKpis() {
  try {
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    const totalCustomers = customersSnapshot.size;
    let totalPointsLiability = 0;
    customersSnapshot.forEach(doc => {
      totalPointsLiability += doc.data().totalPointsBalance || 0;
    });
    return { totalCustomers, totalPointsLiability };
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    // On error, return zero values to prevent breaking the page.
    return { totalCustomers: 0, totalPointsLiability: 0 };
  }
}

// Fetches top 10 customers
export async function getTopCustomers(): Promise<Customer[]> {
  try {
    const customersQuery = query(
      collection(db, 'customers'),
      orderBy('totalPointsBalance', 'desc'),
      limit(10)
    );
    const customersSnapshot = await getDocs(customersQuery);

    const topCustomers: Customer[] = customersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        totalPointsBalance: data.totalPointsBalance || 0,
        membershipLevelId: data.membershipLevelId || '',
        membershipLevelName: data.membershipLevelName || 'N/A',
        membershipLevelColor: data.membershipLevelColor || '#808080',
      };
    });
    return topCustomers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

// Fetches all purchase data for the CSV report
export async function getSalesForReport(): Promise<Omit<Purchase, 'date'> & { date: { seconds: number, nanoseconds: number } }[]> {
  try {
    const purchasesSnapshot = await getDocs(query(collection(db, 'purchases'), orderBy('date', 'desc')));
    const purchases: any[] = [];
    purchasesSnapshot.forEach(doc => {
      const data = doc.data();
      purchases.push({
        id: doc.id,
        ...data,
        // Firestore Timestamps need to be converted to a serializable format for Server Actions
        date: {
          seconds: data.date.seconds,
          nanoseconds: data.date.nanoseconds,
        },
      });
    });
    return purchases;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
}
