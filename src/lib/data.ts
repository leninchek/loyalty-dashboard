import 'server-only';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, type Timestamp } from 'firebase/firestore';

// Data shapes based on user's description
export interface Customer {
  id: string;
  name: string;
  totalPointsBalance: number;
  membershipLevelId: string;
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

export interface TopCustomer extends Customer {
  membershipLevelName: string;
  membershipLevelColor: string;
}

// Fetches KPI data
export async function getKpis() {
  try {
    const customersSnapshot = await getDocs(collection(db, 'Customers'));
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
export async function getTopCustomers(): Promise<TopCustomer[]> {
  try {
    const membershipSnapshot = await getDocs(collection(db, 'MembershipTypes'));
    const membershipMap = new Map<string, { name: string; color: string }>();
    membershipSnapshot.forEach(doc => {
      const data = doc.data();
      membershipMap.set(doc.id, { name: data.name, color: data.color });
    });

    const customersQuery = query(
      collection(db, 'Customers'),
      orderBy('totalPointsBalance', 'desc'),
      limit(10)
    );
    const customersSnapshot = await getDocs(customersQuery);

    const topCustomers: TopCustomer[] = [];
    customersSnapshot.forEach(doc => {
      const customerData = doc.data() as Omit<Customer, 'id'>;
      const membershipInfo = membershipMap.get(customerData.membershipLevelId);
      topCustomers.push({
        id: doc.id,
        ...customerData,
        membershipLevelName: membershipInfo?.name || 'N/A',
        membershipLevelColor: membershipInfo?.color || '#808080',
      });
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
    const purchasesSnapshot = await getDocs(query(collection(db, 'Purchases'), orderBy('date', 'desc')));
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
