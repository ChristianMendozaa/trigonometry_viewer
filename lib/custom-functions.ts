"use client"

import { useState, useEffect } from "react"
import * as math from "mathjs"
import { useAuth } from "@/lib/auth-provider"

export type CustomFunction = {
  id: string
  userId: string
  name: string
  expression: string
  createdAt: string
}

// Mock storage for custom functions (in a real app, this would be in a database)
let customFunctionsStore: CustomFunction[] = [
  {
    id: "1",
    userId: "1",
    name: "SinCosTan",
    expression: "sin(x) + 0.5*cos(2*x) - 0.2*tan(x/2)",
    createdAt: "2023-05-01T10:00:00",
  },
  {
    id: "2",
    userId: "1",
    name: "DoubleSin",
    expression: "sin(x) + sin(2*x)",
    createdAt: "2023-05-02T15:30:00",
  },
]

export function useCustomFunctions() {
  const { user } = useAuth()
  const [userFunctions, setUserFunctions] = useState<CustomFunction[]>([])

  // Load user functions when component mounts or user changes
  useEffect(() => {
    if (user) {
      const functions = customFunctionsStore.filter((func) => func.userId === user.id)
      setUserFunctions(functions)
    } else {
      setUserFunctions([])
    }
  }, [user])

  const saveFunction = async (data: { name: string; expression: string }): Promise<void> => {
    if (!user) throw new Error("Usuario no autenticado")

    // Check if name already exists for this user
    const existingFunction = customFunctionsStore.find((func) => func.userId === user.id && func.name === data.name)

    if (existingFunction) {
      throw new Error("Ya existe una función con este nombre")
    }

    // Create new function
    const newFunction: CustomFunction = {
      id: Date.now().toString(),
      userId: user.id,
      name: data.name,
      expression: data.expression,
      createdAt: new Date().toISOString(),
    }

    // Add to store
    customFunctionsStore = [...customFunctionsStore, newFunction]

    // Update local state
    setUserFunctions((prev) => [...prev, newFunction])

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const deleteFunction = async (id: string): Promise<void> => {
    if (!user) throw new Error("Usuario no autenticado")

    // Remove from store
    customFunctionsStore = customFunctionsStore.filter((func) => func.id !== id)

    // Update local state
    setUserFunctions((prev) => prev.filter((func) => func.id !== id))

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const evaluateFunction = (expression: string, x: number): number => {
    try {
      // Replace common math notations
      const processedExpression = expression
        .replace(/(\d+)x/g, "$1*x")
        .replace(/\)\(/g, ")*(")
        .replace(/(\d+)\(/g, "$1*(")

      // Evaluate the expression at the given x value
      const compiledExpression = math.compile(processedExpression)
      return compiledExpression.evaluate({ x })
    } catch (error) {
      console.error("Error evaluating function:", error)
      return Number.NaN
    }
  }

  return {
    userFunctions,
    saveFunction,
    deleteFunction,
    evaluateFunction,
  }
}

// Update the series utils to handle custom functions
export function evaluateCustomFunction(expression: string, x: number): number {
  try {
    // Replace common math notations
    const processedExpression = expression
      .replace(/(\d+)x/g, "$1*x")
      .replace(/\)\(/g, ")*(")
      .replace(/(\d+)\(/g, "$1*(")

    // Evaluate the expression at the given x value
    const compiledExpression = math.compile(processedExpression)
    return compiledExpression.evaluate({ x })
  } catch (error) {
    console.error("Error evaluating function:", error)
    return Number.NaN
  }
}

