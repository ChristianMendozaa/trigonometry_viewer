"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart, LineChart, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminUsersTable } from "@/components/dashboard/admin-users-table"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"
import { useAuth } from "@/lib/auth-provider"

// 🔥 Importamos nuestro hook personalizado
import { useDashboardStats } from "@/hooks/useDashboardStats"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // 🚀 Hook para datos de dashboard en tiempo real
  const { dashboard, loading } = useDashboardStats()

  // Redirect si no es admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  // Muestra un loader mientras no tengas los datos
  if (loading) {
    return <p>Cargando datos del dashboard...</p>
  }

  // Si no existe el documento "stats" en Firestore
  if (!dashboard) {
    return <p>No hay datos de Dashboard</p>
  }

  // Extraemos los campos que necesitamos
  const {
    total_users = 0,
    total_users_growth = 0,
    total_series_generated = 0,
    global_avg_error = 0.0,
    error_change = 0.0,
    series_growth = 0,
    high_error_series = [],
    top_performing_users = [],
    // ...
  } = dashboard

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
        <p className="text-muted-foreground">Visualiza y analiza los datos de todos los usuarios</p>
      </div>

      {/* Tarjetas principales */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_users}</div>
            <p className="text-xs text-muted-foreground">
              {total_users_growth >= 0 ? `+${total_users_growth}` : total_users_growth} desde el día anterior
            </p>
          </CardContent>
        </Card>

        {/* Series Generadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Series Generadas</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_series_generated}</div>
            <p className="text-xs text-muted-foreground">
              {series_growth >= 0 ? `+${series_growth}` : series_growth} desde el día anterior
            </p>
          </CardContent>
        </Card>

        {/* Error Promedio Global */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Promedio Global</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{global_avg_error.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              {error_change >= 0 ? `+${error_change.toFixed(4)}` : error_change.toFixed(4)} desde el día anterior
            </p>
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

        {/* Tabla de Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>Lista de todos los usuarios y sus datos generados</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pasamos los usuarios reales al componente */}
              <AdminUsersTable users={dashboard.users || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Generales</CardTitle>
              <CardDescription>Análisis de errores por tipo de serie trigonométrica</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <AdminStatsChart seriesStats={dashboard.series_stats || {}} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Usuarios con Mejor Desempeño */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios con Mejor Desempeño</CardTitle>
                <CardDescription>Usuarios con menor error promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {top_performing_users.map((u, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="font-medium">{u.avg_error.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Series con Mayor Tasa de Error */}
            <Card>
              <CardHeader>
                <CardTitle>Series con Mayor Tasa de Error</CardTitle>
                <CardDescription>Tipos de series con mayor error promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {high_error_series.map((s, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.type}</p>
                        <p className="text-xs text-muted-foreground">{s.count} series generadas</p>
                      </div>
                      <div className="font-medium">{s.avg_error.toFixed(4)}</div>
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
