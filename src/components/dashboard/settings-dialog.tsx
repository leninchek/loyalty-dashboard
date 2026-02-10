"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function SettingsDialog() {
  const db = useFirestore();
  const { toast } = useToast();
  const [enableSms, setEnableSms] = useState(true);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // Para controlar si el modal está abierto

  // 1. Escuchar configuración (Igual que antes)
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "Configuration", "general"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setEnableSms(data.enableSms ?? true);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  // 2. Guardar cambios
  const handleToggle = async (checked: boolean) => {
    if (!db) return;
    setEnableSms(checked); // Optimistic UI update

    try {
      await updateDoc(doc(db, "Configuration", "general"), {
        enableSms: checked
      });
      toast({
        title: "Configuración actualizada",
        description: checked ? "Servicio de SMS activado." : "Servicio de SMS detenido.",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      setEnableSms(!checked); // Revertir si falla
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configuración</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración del Sistema</DialogTitle>
          <DialogDescription>
            Administra las integraciones y servicios externos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Opción de Sms */}
          <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Sms SMS</p>
                <p className="text-xs text-muted-foreground">
                  Enviar confirmaciones de compra.
                </p>
              </div>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Switch
                checked={enableSms}
                onCheckedChange={handleToggle}
              />
            )}
          </div>
          
          {/* Aquí podrías agregar más opciones en el futuro (ej: Modo Oscuro, Notificaciones Email, etc.) */}
        
        </div>
      </DialogContent>
    </Dialog>
  );
}