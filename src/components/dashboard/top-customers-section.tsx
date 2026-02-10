"use client";

import { useState, useEffect } from "react";
import TopCustomersTable from "@/components/dashboard/top-customers-table";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import type { Customer, MembershipType } from "@/lib/data";

export default function TopCustomersSection() {
  const db = useFirestore();
  const [rawCustomers, setRawCustomers] = useState<any[]>([]);
  const [membershipLevels, setMembershipLevels] = useState<Record<string, MembershipType>>({});

  useEffect(() => {
    if (!db) return;

    // Subscribe to MembershipTypes
    const unsubMemberships = onSnapshot(collection(db, "MembershipTypes"), (snapshot) => {
      const levels: Record<string, MembershipType> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        levels[doc.id] = {
          id: doc.id,
          name: data.name || "Desconocido",
          rewardRate: data.rewardRate || 0,
          colorHex: data.colorHex || "#808080",
        };
      });
      setMembershipLevels(levels);
    });

    // Subscribe to Top Customers
    const q = query(
      collection(db, "Customers"),
      orderBy("totalPointsBalance", "desc"),
      limit(10)
    );

    const unsubCustomers = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRawCustomers(customersData);
    });

    return () => {
      unsubMemberships();
      unsubCustomers();
    };
  }, [db]);

  const joinedCustomers: Customer[] = rawCustomers.map((data) => {
    const levelId = data.membershipLevelId || "";
    const level = membershipLevels[levelId];
    return {
      id: data.id,
      name: data.name || "Sin Nombre",
      totalPointsBalance: data.totalPointsBalance || 0,
      membershipLevelId: levelId,
      membershipLevelName: level ? level.name : "N/A",
      membershipLevelColor: level ? level.colorHex : "#808080",
    };
  });

  return <TopCustomersTable customers={joinedCustomers} />;
}