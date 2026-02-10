"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getApp } from "firebase/app";

// Inicializamos Auth (asumiendo que Firebase ya está inicializado en tu ClientProvider)
// Si da error, asegúrate de importar tu 'app' inicializada aquí
const auth = getAuth(getApp());

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // REDIRECCIÓN INTELIGENTE
      if (!currentUser && pathname !== "/login") {
        // Si no hay usuario y no estás en login -> Vete al login
        router.push("/login");
      } else if (currentUser && pathname === "/login") {
        // Si YA hay usuario y estás en login -> Vete al dashboard
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}