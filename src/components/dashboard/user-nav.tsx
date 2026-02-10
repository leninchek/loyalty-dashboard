"use client";

import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { getApp } from "firebase/app";

export default function UserNav() {
  const handleLogout = () => {
    const auth = getAuth(getApp());
    signOut(auth);
    // El AuthProvider detectará el cambio y redirigirá al login automáticamente
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-primary">
      <LogOut className="mr-2 h-4 w-4" />
      Salir
    </Button>
  );
}