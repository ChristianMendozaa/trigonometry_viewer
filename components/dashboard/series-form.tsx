"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateSeriesData } from "@/lib/series-utils"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CustomFunction } from "@/lib/custom-functions"
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
  seriesType: z.enum(["sine", "cosine", "tangent", "custom"], {
    required_error: "Por favor seleccione un tipo de serie",
  }),
  customFunctionId: z.string().optional(),
  startValue: z.coerce.number({
    required_error: "Por favor ingrese un valor inicial",
  }),
  endValue: z.coerce.number({
    required_error: "Por favor ingrese un valor final",
  }),
  points: z.coerce
    .number()
    .int()
    .min(10, {
      message: "Debe generar al menos 10 puntos",
    })
    .max(1000, {
      message: "No puede generar más de 1000 puntos",
    }),
})

type SeriesFormProps = {
  onGenerate: (data: any) => void
  customExpression?: string | null
  onCustomExpressionClear?: () => void
  customFunctions: CustomFunction[]
}

export function SeriesForm({
  onGenerate,
  customExpression,
  onCustomExpressionClear,
}: SeriesFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<CustomFunction | null>(null);
  const [loadingFunctions, setLoadingFunctions] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesType: "sine",
      customFunctionId: "",
      startValue: 0,
      endValue: 6.28, // 2π
      points: 100,
    },
  })

  // Set form to custom type when a custom expression is provided
  // 🔹 Obtener las funciones personalizadas del usuario
  useEffect(() => {
    const fetchCustomFunctions = async () => {
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
          throw new Error(errorData.detail || "Error al obtener las funciones guardadas");
        }

        const data = await res.json();
        setCustomFunctions(data);
      } catch (error) {
        console.error("❌ Error al obtener funciones personalizadas:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar funciones",
          description: "No se pudieron cargar las funciones personalizadas.",
        });
      } finally {
        setLoadingFunctions(false);
      }
    };

    fetchCustomFunctions();
  }, [toast]);

  
  // 🔹 Manejar selección de función personalizada
  const handleCustomFunctionChange = (functionId: string) => {
    const selectedFunc = customFunctions.find((f) => f.id === functionId);
    setSelectedFunction(selectedFunc || null);
    form.setValue("customFunctionId", functionId);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      let expressionToUse: string | undefined = undefined;

      if (values.seriesType === "custom") {
        if (customExpression) {
          expressionToUse = customExpression;
        } else if (selectedFunction) {
          expressionToUse = selectedFunction.expression;
        }
      }

      // 🔹 Generar los datos de la serie
      const data = generateSeriesData(
        values.seriesType,
        values.startValue,
        values.endValue,
        values.points,
        expressionToUse
      );

      // 🔹 Obtener el token del usuario autenticado desde localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      if (!token) throw new Error("Usuario no autenticado");

      // 🔹 Enviar los datos al backend para guardar en Firestore
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: values.seriesType,
          points: values.points,
          avgError: data.avgError,
          maxError: data.maxError,
          data: data, // Datos generados
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar la serie");
      }

      // 🔹 Guardar la respuesta del backend, que ahora incluye el ID de la serie
      const savedSeries = await res.json();
      console.log("✅ Serie guardada correctamente en Firestore:", savedSeries);

      // 🔹 Añadir el `id` al `data` generado antes de pasarlo a `onGenerate`
      const updatedData = { ...data, id: savedSeries.id };

      // 🔹 Mostrar la gráfica con los datos generados, incluyendo el `id`
      onGenerate(updatedData);
    } catch (error) {
      console.error("❌ Error al generar la serie:", error);
    } finally {
      setIsGenerating(false);
    }
  }


  const seriesType = form.watch("seriesType")
  const showCustomFunctionSelector = seriesType === "custom" && !customExpression
  const hasCustomFunctions = customFunctions.length > 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="seriesType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Serie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo de serie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sine">Seno</SelectItem>
                  <SelectItem value="cosine">Coseno</SelectItem>
                  <SelectItem value="tangent">Tangente</SelectItem>
                  <SelectItem value="custom">Personalizada</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Seleccione el tipo de función trigonométrica a generar</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomFunctionSelector && (
          <>
            {hasCustomFunctions ? (
              <FormField
                control={form.control}
                name="customFunctionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Función Personalizada</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleCustomFunctionChange(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una función personalizada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customFunctions.map((func) => (
                          <SelectItem key={func.id} value={func.id}>
                            {func.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Seleccione una de sus funciones personalizadas guardadas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tiene funciones personalizadas guardadas. Vaya a la pestaña "Funciones Personalizadas" para crear
                  una.
                </AlertDescription>
              </Alert>
            )}

            {selectedFunction && (
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="px-3 py-1">
                    {selectedFunction.name}
                  </Badge>
                </div>
                <code className="text-sm block mt-2">f(x) = {selectedFunction.expression}</code>
              </div>
            )}
          </>
        )}

        {seriesType === "custom" && customExpression && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="px-3 py-1">
                Función personalizada
              </Badge>
              {onCustomExpressionClear && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCustomExpressionClear}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpiar</span>
                </Button>
              )}
            </div>
            <code className="text-sm block mt-2">f(x) = {customExpression}</code>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Inicial</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Final</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Puntos</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>Número de puntos a generar en el intervalo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isGenerating || (seriesType === "custom" && !customExpression && !selectedFunction)}
        >
          {isGenerating ? "Generando..." : "Generar Serie"}
        </Button>
      </form>
    </Form>
  )
}

