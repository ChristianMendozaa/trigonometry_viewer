"use client";

import { useState, useEffect } from "react";
import { Calendar, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeriesChart } from "@/components/dashboard/series-chart";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function SavedResultsList() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // 🔹 Cargar los resultados desde el backend cuando el componente se monta
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user?.token;
        if (!token) throw new Error("Usuario no autenticado");

        const res = await fetch(`${API_URL}/results/saved`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Error al obtener los resultados");
        }

        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("❌ Error al obtener los resultados:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar resultados",
          description: "No se pudieron cargar los resultados.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
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

  const handleViewResult = (result: any) => {
    if (!result.series || !result.series.data) {
      toast({
        variant: "destructive",
        title: "Error al visualizar",
        description: "No hay datos disponibles para esta serie.",
      });
      return;
    }
    setSelectedResult(result.series);
    setDialogOpen(true);
  };

  const handleDeleteResult = async (id: string) => {
    setIsDeleting(id);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(`${API_URL}/results/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al eliminar el resultado");
      }

      setResults((prevResults) => prevResults.filter((result) => result.resultId !== id));

      toast({
        title: "Resultado eliminado",
        description: "El resultado ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error("❌ Error al eliminar resultado:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el resultado.",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Mostrando los resultados guardados</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Cargando resultados...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay resultados guardados.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Genere una serie y guarde los resultados para verlos aquí.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Error Promedio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.resultId}>
                  <TableCell>{formatDate(result.dateSaved)}</TableCell>
                  <TableCell>{translateSeriesType(result.series.type)}</TableCell>
                  <TableCell>{result.series.points}</TableCell>
                  <TableCell>{result.series.avgError.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewResult(result)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-[500px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el resultado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteResult(result.resultId)}
                              disabled={isDeleting === result.resultId}
                              className="w-full sm:w-auto"
                            >
                              {isDeleting === result.resultId ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
          </DialogHeader>
          <div className="h-[300px]">
            {selectedResult && selectedResult.data ? (
              <SeriesChart data={selectedResult.data} />
            ) : (
              <p className="text-center text-muted-foreground">No hay datos disponibles.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
