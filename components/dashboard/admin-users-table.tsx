"use client"

import { useState } from "react"
import { ChevronDown, Download, Eye, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SeriesChart } from "@/components/dashboard/series-chart"

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Ana Martínez",
    email: "ana@ejemplo.com",
    role: "user",
    seriesCount: 15,
    avgError: 0.0012,
    lastActive: "2023-05-12T14:30:00",
    series: [
      {
        id: "1",
        date: "2023-05-10T14:30:00",
        type: "sine",
        points: 100,
        avgError: 0.0023,
        maxError: 0.0089,
        data: {
          labels: Array.from({ length: 10 }, (_, i) => i.toString()),
          generated: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
          ideal: Array.from({ length: 10 }, (_, i) => Math.sin((i / 5) * Math.PI)),
          error: Array.from({ length: 10 }, () => Math.random() * 0.01),
        },
      },
    ],
  },
  {
    id: "2",
    name: "Carlos López",
    email: "carlos@ejemplo.com",
    role: "user",
    seriesCount: 8,
    avgError: 0.0018,
    lastActive: "2023-05-11T10:15:00",
    series: [],
  },
  {
    id: "3",
    name: "Elena Gómez",
    email: "elena@ejemplo.com",
    role: "user",
    seriesCount: 12,
    avgError: 0.0023,
    lastActive: "2023-05-09T16:45:00",
    series: [],
  },
  {
    id: "4",
    name: "Administrador",
    email: "admin@ejemplo.com",
    role: "admin",
    seriesCount: 5,
    avgError: 0.0025,
    lastActive: "2023-05-12T09:30:00",
    series: [],
  },
]

export function AdminUsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filtrar
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Todos los usuarios</DropdownMenuItem>
            <DropdownMenuItem>Usuarios normales</DropdownMenuItem>
            <DropdownMenuItem>Administradores</DropdownMenuItem>
            <DropdownMenuItem>Activos recientemente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Series Generadas</TableHead>
              <TableHead>Error Promedio</TableHead>
              <TableHead>Última Actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </TableCell>
                <TableCell>{user.seriesCount}</TableCell>
                <TableCell>{user.avgError.toFixed(4)}</TableCell>
                <TableCell>{formatDate(user.lastActive)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  {selectedUser.name} - {selectedUser.email}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Rol</p>
                  <p className="font-medium">{selectedUser.role === "admin" ? "Administrador" : "Usuario"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Series</p>
                  <p className="font-medium">{selectedUser.seriesCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Error Promedio</p>
                  <p className="font-medium">{selectedUser.avgError.toFixed(4)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Última Actividad</p>
                  <p className="font-medium">{formatDate(selectedUser.lastActive)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Series Recientes</h3>
                {selectedUser.series.length > 0 ? (
                  <div className="h-[300px]">
                    <SeriesChart data={selectedUser.series[0].data} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay series recientes</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

