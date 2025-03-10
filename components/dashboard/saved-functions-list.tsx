"use client"

import { useState } from "react"
import { Edit, Play, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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
} from "@/components/ui/alert-dialog"

type CustomFunction = {
  id: string
  name: string
  expression: string
  createdAt: string
}

type SavedFunctionsListProps = {
  functions: CustomFunction[]
  onDelete: (id: string) => Promise<void>
  onUse: (func: CustomFunction) => void
}

export function SavedFunctionsList({ functions, onDelete, onUse }: SavedFunctionsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await onDelete(id)
      toast({
        title: "Función eliminada",
        description: "La función ha sido eliminada correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar la función. Inténtelo de nuevo.",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (functions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay funciones personalizadas guardadas.</p>
        <p className="text-sm text-muted-foreground mt-1">Cree una nueva función utilizando el formulario.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {functions.map((func) => (
        <Card key={func.id} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="truncate text-base sm:text-lg" title={func.name}>
              {func.name}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Creada el {new Date(func.createdAt).toLocaleDateString("es-ES")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="bg-muted p-2 rounded-md overflow-x-auto">
              <code className="text-xs sm:text-sm break-all whitespace-pre-wrap">f(x) = {func.expression}</code>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-wrap gap-2 justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-center sm:text-left">{func.name}</DialogTitle>
                  <DialogDescription className="text-center sm:text-left">
                    Detalles de la función personalizada
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="text-sm font-medium">Expresión</h4>
                    <div className="mt-1 bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-sm">f(x) = {func.expression}</code>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Fecha de creación</h4>
                    <p className="text-sm text-muted-foreground">{new Date(func.createdAt).toLocaleString("es-ES")}</p>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button onClick={() => onUse(func)} className="w-full sm:w-auto">
                    <Play className="h-4 w-4 mr-2" />
                    Usar esta función
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8 text-xs sm:text-sm">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-[500px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la función
                    <span className="font-medium"> {func.name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(func.id)}
                    disabled={isDeleting === func.id}
                    className="w-full sm:w-auto"
                  >
                    {isDeleting === func.id ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

