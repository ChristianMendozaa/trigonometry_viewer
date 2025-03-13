"use client"
import { useState } from "react"
import { ChevronDown, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type UserType = {
  id: string
  name: string
  email: string
  role: string
  total_series_generated?: number
  avg_error?: number
  last_activity?: string
}

interface AdminUsersTableProps {
  users: UserType[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  function formatDate(timestampOrDate?: any): string {
    if (!timestampOrDate) return "N/A"
  
    // Si ya es un objeto "seconds"/"nanoseconds" (Timestamp de Firestore)
    if (timestampOrDate.seconds) {
      const date = new Date(timestampOrDate.seconds * 1000)
      return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    }
  
    // Si fuera un string ISO
    if (typeof timestampOrDate === "string") {
      const maybeDate = new Date(timestampOrDate)
      if (!isNaN(maybeDate.getTime())) {
        return new Intl.DateTimeFormat("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(maybeDate)
      }
      // Si no se puede parsear, devuelves la cadena tal cual
      return timestampOrDate
    }
  
    // Si no es nada de lo anterior, retorna fallback
    return "N/A"
  }  

  // Filtrar por nombre o email
  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || ""
    const email = user.email?.toLowerCase() || ""
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    )
  })

  const handleViewUser = (user: UserType) => {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} onClick={() => handleViewUser(user)}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </TableCell>
                <TableCell>{user.total_series_generated ?? 0}</TableCell>
                <TableCell>{(user.avg_error ?? 0).toFixed(4)}</TableCell>
                <TableCell>{formatDate(user.last_activity)}</TableCell>
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
                  <p className="font-medium">
                    {selectedUser.role === "admin" ? "Administrador" : "Usuario"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Series</p>
                  <p className="font-medium">
                    {selectedUser.total_series_generated ?? 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Error Promedio</p>
                  <p className="font-medium">
                    {(selectedUser.avg_error ?? 0).toFixed(4)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Última Actividad</p>
                  <p className="font-medium">{formatDate(selectedUser.last_activity)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
