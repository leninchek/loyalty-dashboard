import 'server-only';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, type Timestamp, doc, getDoc, where, startAfter } from 'firebase/firestore';

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
  colorHex: string;
}

export interface Purchase {
  id: string;
  customerId: string;
  customerName?: string;
  totalAmount: number;
  pointsEarned: number;
  date: Timestamp;
}

async function getMembershipLevelsMap(): Promise<Record<string, MembershipType>> {
  try {
    const snapshot = await getDocs(collection(db, 'MembershipTypes'));
    const levels: Record<string, MembershipType> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id; 
      levels[id] = {
        id: id,
        name: data.name || 'Desconocido',
        rewardRate: data.rewardRate || 0,
        colorHex: data.colorHex || '#808080'
      };
    });
    
    return levels;
  } catch (error) {
    console.error("Error fetching membership levels:", error);
    return {};
  }
}

async function getPointValue(): Promise<number> {
  try {
    const docRef = doc(db, 'Configuration', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().pointValue || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching point value:", error);
    return 0;
  }
}

export async function getKpis() {
  try {
    const statsDoc = await getDoc(doc(db, 'Stats', 'general'));
    
    let totalCustomers = 0;
    let totalPointsLiability = 0;

    if (statsDoc.exists()) {
      const data = statsDoc.data();
      totalCustomers = data.totalCustomers || 0;
      totalPointsLiability = data.totalPointsLiability || 0;
    }

    const pointValue = await getPointValue();
    const totalLiabilityValue = totalPointsLiability * pointValue;

    return { totalCustomers, totalPointsLiability, totalLiabilityValue };
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return { totalCustomers: 0, totalPointsLiability: 0, totalLiabilityValue: 0 };
  }
}

export async function getTopCustomers(): Promise<Customer[]> {
  try {
    const membershipLevels = await getMembershipLevelsMap();

    const customersQuery = query(
      collection(db, 'Customers'),
      orderBy('totalPointsBalance', 'desc'),
      limit(10)
    );
    const customersSnapshot = await getDocs(customersQuery);

    const topCustomers: Customer[] = customersSnapshot.docs.map(doc => {
      const data = doc.data();
      const levelId = data.membershipLevelId || '';
      const level = membershipLevels[levelId];

      return {
        id: doc.id,
        name: data.name || 'Sin Nombre',
        totalPointsBalance: data.totalPointsBalance || 0,
        membershipLevelId: levelId,
        membershipLevelName: level ? level.name : 'N/A',
        membershipLevelColor: level ? level.colorHex : '#808080',
      };
    });
    return topCustomers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

export async function getSalesForReport(startDate?: Date, endDate?: Date): Promise<(Omit<Purchase, 'date'> & { date: { seconds: number, nanoseconds: number } })[]> {
  try {
    let q = query(collection(db, 'Purchases'), orderBy('date', 'desc'));

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }
    
    const purchasesSnapshot = await getDocs(q);
    const purchases: (Omit<Purchase, 'date'> & { date: { seconds: number, nanoseconds: number } })[] = [];
    
    purchasesSnapshot.forEach(doc => {
      const data = doc.data();
      purchases.push({
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName || 'Desconocido',
        totalAmount: data.totalAmount,
        pointsEarned: data.pointsEarned,
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

export async function getSalesPaginated(limitCount: number = 20, lastDocId?: string) {
  try {
    let q = query(collection(db, 'Purchases'), orderBy('date', 'desc'), limit(limitCount));

    if (lastDocId) {
      const lastDocSnap = await getDoc(doc(db, 'Purchases', lastDocId));
      if (lastDocSnap.exists()) {
        q = query(collection(db, 'Purchases'), orderBy('date', 'desc'), startAfter(lastDocSnap), limit(limitCount));
      }
    }
    
    const snapshot = await getDocs(q);
    
    const purchases = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId,
        customerName: data.customerName || 'Desconocido',
        totalAmount: data.totalAmount,
        pointsEarned: data.pointsEarned,
        date: {
          seconds: data.date.seconds,
          nanoseconds: data.date.nanoseconds,
        },
      };
    });

    return {
      data: purchases,
      lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    };
  } catch (error) {
    console.error("Error fetching paginated sales:", error);
    return { data: [], lastDocId: null };
  }
}
