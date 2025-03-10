"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import * as math from "mathjs"
import { AlertCircle, Check, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  functionName: z
    .string()
    .min(3, {
      message: "El nombre de la función debe tener al menos 3 caracteres.",
    })
    .max(50, {
      message: "El nombre de la función no puede exceder 50 caracteres.",
    })
    .refine((name) => /^[a-zA-Z0-9_]+$/.test(name), {
      message: "El nombre solo puede contener letras, números y guiones bajos.",
    }),
  functionExpression: z.string().min(1, {
    message: "La expresión de la función no puede estar vacía.",
  }),
})

type CustomFunctionFormProps = {
  onSave: (data: { name: string; expression: string }) => Promise<void>
}

export function CustomFunctionForm({ onSave }: CustomFunctionFormProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    preview?: number[]
  } | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      functionName: "",
      functionExpression: "",
    },
  })

  const validateExpression = (expression: string) => {
    setIsValidating(true)
    setValidationResult(null)

    try {
      // Replace common math notations to ensure they work with mathjs
      const processedExpression = expression
        .replace(/(\d+)x/g, "$1*x") // Replace 2x with 2*x
        .replace(/\)\(/g, ")*(") // Replace )( with )*(
        .replace(/(\d+)\(/g, "$1*(") // Replace 2( with 2*(

      // Compile the expression to check for syntax errors
      const compiledExpression = math.compile(processedExpression)

      // Generate sample values to test the function
      const sampleValues = Array.from({ length: 5 }, (_, i) => (i * Math.PI) / 4)
      const previewValues = sampleValues.map((x) => {
        const result = compiledExpression.evaluate({ x })
        // Check if result is a valid number
        if (isNaN(result) || !isFinite(result)) {
          throw new Error("La función genera valores no válidos para algunos puntos.")
        }
        return result
      })

      setValidationResult({
        isValid: true,
        message: "La expresión es válida.",
        preview: previewValues,
      })
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: error instanceof Error ? error.message : "Error de sintaxis en la expresión.",
      })
    } finally {
      setIsValidating(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!validationResult?.isValid) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor, corrija los errores en la expresión antes de guardar.",
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: values.functionName,
        expression: values.functionExpression,
      })

      toast({
        title: "Función guardada",
        description: `La función "${values.functionName}" ha sido guardada correctamente.`,
      })

      // Reset form after successful save
      form.reset()
      setValidationResult(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la función. Inténtelo de nuevo.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="functionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Función</FormLabel>
              <FormControl>
                <Input placeholder="MiFuncionTrigonometrica" {...field} />
              </FormControl>
              <FormDescription>Asigne un nombre único para identificar esta función.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="functionExpression"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expresión Matemática</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="sin(x) + 0.5*cos(2*x)"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setValidationResult(null)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => validateExpression(field.value)}
                    disabled={isValidating || !field.value}
                  >
                    Validar
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Ingrese una expresión trigonométrica utilizando x como variable. Ejemplo: sin(x) + 0.5*cos(2*x)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {validationResult && (
          <Alert variant={validationResult.isValid ? "default" : "destructive"}>
            {validationResult.isValid ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{validationResult.isValid ? "Expresión válida" : "Error de sintaxis"}</AlertTitle>
            <AlertDescription>
              {validationResult.message}
              {validationResult.isValid && validationResult.preview && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Vista previa para x = [0, π/4, π/2, 3π/4, π]:</p>
                  <p className="font-mono text-sm">[{validationResult.preview.map((v) => v.toFixed(3)).join(", ")}]</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isSaving || !validationResult?.isValid}>
          {isSaving ? (
            "Guardando..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Función
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

