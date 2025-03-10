"use client"

import { useState } from "react"
import { LineChart, Settings, History, BookmarkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SeriesForm } from "@/components/dashboard/series-form"
import { SeriesChart } from "@/components/dashboard/series-chart"
import { SeriesHistory } from "@/components/dashboard/series-history"
import { useAuth } from "@/lib/auth-provider"
import { CustomFunctionForm } from "@/components/dashboard/custom-function-form"
import { SavedFunctionsList } from "@/components/dashboard/saved-functions-list"
import { useCustomFunctions } from "@/lib/custom-functions"
import { SavedResultsList } from "@/components/dashboard/saved-results-list"
import { useSavedResults } from "@/lib/saved-results"

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("generator")
  const [seriesData, setSeriesData] = useState<any>(null)
  const { userFunctions, saveFunction, deleteFunction } = useCustomFunctions()
  const [selectedCustomFunction, setSelectedCustomFunction] = useState<string | null>(null)
  const { userResults, saveResult, deleteResult } = useSavedResults()
  const handleUseCustomFunction = (func: any) => {
    setSelectedCustomFunction(func.expression)
    setActiveTab("generator")
  }

  const handleSaveResults = async () => {
    try {
      if (!seriesData || !seriesData.id) {
        console.error("❌ No hay datos de serie o falta el ID de la serie.");
        return;
      }
  
      // Verificar el usuario autenticado
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      const uid = user?.id; // 🔹 Obtener el ID del usuario
  
      if (!token || !uid) throw new Error("Usuario no autenticado");
  
      // 🔹 Construcción del payload con `uid` y `seriesId`
      const payload = {
        uid, // Enviar explícitamente el UID del usuario
        seriesId: seriesData.id, // ID de la serie generada en Firestore
      };
  
      console.log("🔹 Payload enviado al backend:", JSON.stringify(payload, null, 2));
  
      // Enviar los resultados al backend
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
    } catch (error) {
      console.error("❌ Error al guardar los resultados:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground">Genera y visualiza series trigonométricas personalizadas</p>
      </div>

      <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="generator" className="flex-1 sm:flex-none">
            <LineChart className="mr-2 h-4 w-4" />
            Generador
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 sm:flex-none">
            <History className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 sm:flex-none">
            <BookmarkIcon className="mr-2 h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1 sm:flex-none">
            <Settings className="mr-2 h-4 w-4" />
            Funciones Personalizadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
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
                    <Button onClick={handleSaveResults}>Guardar Resultados</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Series Generadas</CardTitle>
              <CardDescription>Visualiza y compara tus series trigonométricas anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Resultados Guardados</CardTitle>
              <CardDescription>Accede a tus análisis de series guardados</CardDescription>
            </CardHeader>
            <CardContent>
              <SavedResultsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crear Función Personalizada</CardTitle>
                <CardDescription>Define tu propia función trigonométrica</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomFunctionForm onSave={saveFunction} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funciones Guardadas</CardTitle>
                <CardDescription>Tus funciones trigonométricas personalizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <SavedFunctionsList
                  functions={userFunctions}
                  onDelete={deleteFunction}
                  onUse={handleUseCustomFunction}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

