"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase/provider";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getCountFromServer 
} from "firebase/firestore";


type MembershipType = {
  id: string;
  name: string;
  rewardRate: number;
  colorHex: string;
};

export default function MembershipsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [levels, setLevels] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MembershipType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db) return;
    
    const unsub = onSnapshot(collection(db, "MembershipTypes"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipType));
      setLevels(data.sort((a, b) => a.rewardRate - b.rewardRate));
      setLoading(false);
    });

    return () => unsub();
  }, [db]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingLevel) return;
    
    setIsSaving(true);

    try {
      const docRef = editingLevel.id 
        ? doc(db, "MembershipTypes", editingLevel.id)
        : doc(collection(db, "MembershipTypes"));

      await setDoc(docRef, {
        name: editingLevel.name,
        rewardRate: Number(editingLevel.rewardRate),
        colorHex: editingLevel.colorHex
      });

      toast({ title: "Guardado", description: "El nivel de membresía se ha actualizado correctamente." });
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar el nivel.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (level: MembershipType) => {
    if (!db) return;

    try {
      const customersRef = collection(db, "Customers");
      const q = query(customersRef, where("membershipLevelId", "==", level.id));
      
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      if (count > 0) {
        toast({
          title: "Operación bloqueada",
          description: `No puedes eliminar el nivel "${level.name}" porque hay ${count} cliente(s) asignados a él. Mueve a esos clientes a otro nivel primero.`,
          variant: "destructive"
        });
        return; 
      }

      if (!confirm(`¿Estás seguro de eliminar el nivel "${level.name}"? Esta acción es irreversible.`)) return;

      await deleteDoc(doc(db, "MembershipTypes", level.id));
      
      toast({ 
        title: "Nivel Eliminado", 
        description: `El nivel "${level.name}" ha sido borrado.` 
      });

    } catch (error) {
      console.error("Error al eliminar:", error);
      toast({ title: "Error", description: "Hubo un problema al verificar la base de datos.", variant: "destructive" });
    }
  };

  const openModal = (level?: MembershipType) => {
    if (level) {
      setEditingLevel({ ...level });
    } else {
      setEditingLevel({ id: "", name: "", rewardRate: 0.05, colorHex: "#3b82f6" }); 
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Niveles de Lealtad</h1>
          <p className="text-muted-foreground">Configura los rangos, colores y beneficios.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Nivel
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Nivel</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Tasa de Recompensa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.length === 0 && !loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No hay niveles configurados. Crea el primero.
                    </TableCell>
                </TableRow>
            ) : (
                levels.map((level) => (
                <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell>
                    <div className="flex items-center gap-2">
                        <div 
                        className="h-6 w-6 rounded-full border shadow-sm" 
                        style={{ backgroundColor: level.colorHex }} 
                        />
                        <code className="text-xs text-muted-foreground">{level.colorHex}</code>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant="outline" className="font-mono">
                        {(level.rewardRate * 100).toFixed(0)}%
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground">
                        (Gana {(level.rewardRate * 1000).toLocaleString('es-MX')} pts por cada $1,000 MXN)
                    </span>
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(level)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" 
                        onClick={() => handleDelete(level)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLevel?.id ? "Editar Nivel" : "Crear Nuevo Nivel"}</DialogTitle>
            <DialogDescription>
                Ajusta los parámetros del nivel. Los cambios se reflejarán inmediatamente en la App.
            </DialogDescription>
          </DialogHeader>
          
          {editingLevel && (
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Nivel</Label>
                <Input 
                  id="name"
                  value={editingLevel.name} 
                  onChange={(e) => setEditingLevel({...editingLevel, name: e.target.value})} 
                  placeholder="Ej: Oro, Platino, VIP..." 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Recompensa (0-1)</Label>
                  <Input 
                    id="rate"
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="1"
                    value={editingLevel.rewardRate} 
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setEditingLevel({
                        ...editingLevel, 
                        rewardRate: isNaN(val) ? 0 : val 
                        });
                    }}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Ej: 0.10 es 10%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <div className="relative h-10 w-12 overflow-hidden rounded-md border">
                        <Input 
                        id="color"
                        type="color" 
                        value={editingLevel.colorHex} 
                        className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer p-0 border-0"
                        onChange={(e) => setEditingLevel({...editingLevel, colorHex: e.target.value})} 
                        />
                    </div>
                    <Input 
                      value={editingLevel.colorHex} 
                      onChange={(e) => setEditingLevel({...editingLevel, colorHex: e.target.value})} 
                      placeholder="#000000"
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa pequeña */}
              <div className="rounded-lg border p-3 bg-muted/30 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vista Previa:</span>
                <Badge 
                    className="px-3 py-1 text-sm border-0"
                    style={{ 
                        backgroundColor: editingLevel.colorHex,
                        color: "#ffffff"
                    }}
                >
                    {editingLevel.name || "Nombre"}
                </Badge>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="mr-2 h-4 w-4" />}
                    Guardar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}