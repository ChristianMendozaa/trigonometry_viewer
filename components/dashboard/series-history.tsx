"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeriesChart } from "@/components/dashboard/series-chart";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // URL del backend

export function SeriesHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga 🔄
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user?.token;
        if (!token) throw new Error("Usuario no autenticado");

        const res = await fetch(`${API_URL}/results/history`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Error al obtener historial de series");
        }

        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("❌ Error obteniendo historial:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar historial",
          description: "No se pudieron obtener las series generadas.",
        });
      } finally {
        setIsLoading(false); // Finaliza la carga 🔄
      }
    };

    fetchHistory();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const translateSeriesType = (type: string) => {
    const types: Record<string, string> = {
      sine: "Seno",
      cosine: "Coseno",
      tangent: "Tangente",
      custom: "Personalizada",
    };
    return types[type] || type;
  };

  const handleViewSeries = (series: any) => {
    setSelectedSeries(series);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Historial de series generadas</span>
        </div>
      </div>

      {/* 🔄 Mostrar loader mientras se cargan los datos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Cargando historial...</p>
        </div>
      ) : history.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay series generadas aún.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Error Promedio</TableHead>
                <TableHead>Error Máximo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((series) => (
                <TableRow key={series.id}>
                  <TableCell>{formatDate(series.date)}</TableCell>
                  <TableCell>{translateSeriesType(series.type)}</TableCell>
                  <TableCell>{series.points}</TableCell>
                  <TableCell>{series.avgError.toFixed(4)}</TableCell>
                  <TableCell>{series.maxError.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewSeries(series)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Serie</DialogTitle>
            <DialogDescription>
              {selectedSeries && (
                <>
                  {translateSeriesType(selectedSeries.type)} - {formatDate(selectedSeries.date)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[300px]">{selectedSeries && <SeriesChart data={selectedSeries.data} />}</div>
          {selectedSeries && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="font-medium">{translateSeriesType(selectedSeries.type)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Puntos</p>
                <p className="font-medium">{selectedSeries.points}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Error Promedio</p>
                <p className="font-medium">{selectedSeries.avgError.toFixed(4)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Error Máximo</p>
                <p className="font-medium">{selectedSeries.maxError.toFixed(4)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
