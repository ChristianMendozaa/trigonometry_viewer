"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart, LineChart, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminUsersTable } from "@/components/dashboard/admin-users-table"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"
import { useAuth } from "@/lib/auth-provider"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
        <p className="text-muted-foreground">Visualiza y analiza los datos de todos los usuarios</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Series Generadas</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+28 desde la semana pasada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Promedio Global</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0027</div>
            <p className="text-xs text-muted-foreground">-0.0005 desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart className="mr-2 h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>Lista de todos los usuarios y sus datos generados</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Generales</CardTitle>
              <CardDescription>Análisis de errores por tipo de serie trigonométrica</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <AdminStatsChart />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios con Mejor Desempeño</CardTitle>
                <CardDescription>Usuarios con menor error promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ana Martínez", email: "ana@ejemplo.com", avgError: 0.0012 },
                    { name: "Carlos López", email: "carlos@ejemplo.com", avgError: 0.0018 },
                    { name: "Elena Gómez", email: "elena@ejemplo.com", avgError: 0.0023 },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="font-medium">{user.avgError.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Series con Mayor Tasa de Error</CardTitle>
                <CardDescription>Tipos de series con mayor error promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Tangente", count: 42, avgError: 0.0038 },
                    { type: "Personalizada", count: 28, avgError: 0.0031 },
                    { type: "Seno", count: 56, avgError: 0.0022 },
                  ].map((series, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{series.type}</p>
                        <p className="text-xs text-muted-foreground">{series.count} series generadas</p>
                      </div>
                      <div className="font-medium">{series.avgError.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

