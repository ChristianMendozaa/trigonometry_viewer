"use client";

import { useState, useEffect } from "react";
import { LineChart, Settings, History, Save, BookmarkIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeriesForm } from "@/components/dashboard/series-form";
import { SeriesChart } from "@/components/dashboard/series-chart";
import { SeriesHistory } from "@/components/dashboard/series-history";
import { useAuth } from "@/lib/auth-provider";
import { CustomFunctionForm } from "@/components/dashboard/custom-function-form";
import { SavedFunctionsList } from "@/components/dashboard/saved-functions-list";
import { SavedResultsList } from "@/components/dashboard/saved-results-list";
import { useCustomFunctions } from "@/lib/custom-functions";
import { useSavedResults } from "@/lib/saved-results";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("generator");
  const [seriesData, setSeriesData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { userFunctions, saveFunction } = useCustomFunctions();
  const { toast } = useToast();

  const [selectedCustomFunction, setSelectedCustomFunction] = useState<string | null>(null);

  const [functions, setFunctions] = useState([]); // 🔹 Estado para las funciones guardadas

  // 🔹 Función para obtener funciones guardadas
  const fetchFunctions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(`${API_URL}/functions/saved`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al obtener funciones");
      }

      const data = await res.json();
      setFunctions(data);
    } catch (error) {
      console.error("❌ Error al obtener funciones:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar funciones",
        description: "No se pudieron cargar las funciones guardadas.",
      });
    }
  };

  useEffect(() => {
    fetchFunctions(); // 🔹 Cargar funciones al montar el componente
  }, []);

  const handleUseCustomFunction = (func: any) => {
    setSelectedCustomFunction(func.expression);
    setActiveTab("generator");
  };

  const handleSaveResults = async () => {
    if (!seriesData || !seriesData.id) {
      console.error("❌ No hay datos de serie o falta el ID de la serie.");
      return;
    }

    setIsSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      const uid = user?.id;

      if (!token || !uid) throw new Error("Usuario no autenticado");

      const payload = {
        uid,
        seriesId: seriesData.id,
      };

      console.log("🔹 Payload enviado al backend:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/results/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error en la respuesta del backend:", errorData);
        throw new Error(errorData.detail || "Error al guardar los resultados");
      }

      console.log("✅ Resultados guardados correctamente en Firestore");

      toast({
        title: "Resultados guardados",
        description: "Los resultados de la serie se guardaron exitosamente.",
      });
    } catch (error) {
      console.error("❌ Error al guardar los resultados:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar los resultados. Inténtelo de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "generator", icon: <LineChart className="h-5 w-5" />, label: "Generador" },
    { id: "history", icon: <History className="h-5 w-5" />, label: "Historial" },
    { id: "saved", icon: <BookmarkIcon className="h-5 w-5" />, label: "Resultados" },
    { id: "custom", icon: <Settings className="h-5 w-5" />, label: "Funciones" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground">Genera y visualiza series trigonométricas personalizadas</p>
      </div>

            {/* Navegación móvil (bottom navigation) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="pb-20 md:pb-0">
        {activeTab === "generator" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Generador de Series</CardTitle>
                  <CardDescription>Configura los parámetros para generar una serie trigonométrica</CardDescription>
                </CardHeader>
                <CardContent>
                  <SeriesForm
                    onGenerate={setSeriesData}
                    customExpression={selectedCustomFunction}
                    onCustomExpressionClear={() => setSelectedCustomFunction(null)}
                    customFunctions={userFunctions}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visualización</CardTitle>
                  <CardDescription>Comparación entre valores generados y valores ideales</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {seriesData ? (
                    <SeriesChart data={seriesData} />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Genera una serie para visualizar los resultados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {seriesData && (
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Error</CardTitle>
                  <CardDescription>Detalle del error entre valores generados y valores ideales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Error Máximo</p>
                        <p className="text-2xl font-bold">{seriesData.maxError.toFixed(4)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Error Mínimo</p>
                        <p className="text-2xl font-bold">{seriesData.minError.toFixed(4)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Error Promedio</p>
                        <p className="text-2xl font-bold">{seriesData.avgError.toFixed(4)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Desviación Estándar</p>
                        <p className="text-2xl font-bold">{seriesData.stdError.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveResults} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Resultados
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Series Generadas</CardTitle>
            </CardHeader>
            <CardContent>
              <SeriesHistory />
            </CardContent>
          </Card>
        )}

        {activeTab === "saved" && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados Guardados</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedResultsList />
            </CardContent>
          </Card>
        )}
        {activeTab === "custom" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crear Función Personalizada</CardTitle>
                <CardDescription>Define tu propia función trigonométrica</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomFunctionForm onSave={fetchFunctions} /> {/* 🔹 Pasar fetchFunctions para actualizar la lista */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funciones Guardadas</CardTitle>
                <CardDescription>Tus funciones trigonométricas personalizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <SavedFunctionsList functions={functions} onUse={handleUseCustomFunction} refreshFunctions={fetchFunctions} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
