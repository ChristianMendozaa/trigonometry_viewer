"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";

export type SavedResult = {
  id: string;
  userId: string;
  name: string;
  date: string;
  seriesType: string;
  customFunctionName?: string;
  customExpression?: string;
  startValue: number;
  endValue: number;
  points: number;
  maxError: number;
  minError: number;
  avgError: number;
  stdError: number;
  data: {
    labels: string[];
    generated: number[];
    ideal: number[];
    error: number[];
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useSavedResults() {
  const { user } = useAuth();
  const [userResults, setUserResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar resultados desde Firestore al montar el componente
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Verificar el token del usuario autenticado
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user) return;
        const token = user?.token;
        if (!token) throw new Error("Usuario no autenticado");

        const res = await fetch(`${API_URL}/results/saved`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Error al obtener resultados guardados");
        }

        const data = await res.json();
        setUserResults(data);
      } catch (error) {
        console.error("❌ Error obteniendo resultados guardados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const saveResult = async (data: Omit<SavedResult, "id" | "userId" | "date">): Promise<void> => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      // Verificar el token del usuario autenticado
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(`${API_URL}/results/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al guardar el resultado");
      }

      const savedResult = await res.json(); // 🔹 Recibe el objeto guardado del backend con `id` y `date`

      // 🔹 Agrega el nuevo resultado al estado asegurando que tenga todas las propiedades requeridas
      setUserResults((prev) => [
        ...prev,
        {
          id: savedResult.id, // 🔹 Usa el `id` generado por Firestore
          userId: user.id,
          date: savedResult.date || new Date().toISOString(), // 🔹 Usa la fecha del servidor o la actual
          ...data,
        } as SavedResult, // 🔹 Asegura el tipo correcto
      ]);
    } catch (error) {
      console.error("❌ Error guardando resultado:", error);
    }
  };


  // 🔹 Eliminar un resultado desde Firestore
  const deleteResult = async (id: string): Promise<void> => {
    if (!user) throw new Error("Usuario no autenticado");

    try {
      // Verificar el token del usuario autenticado
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(`${API_URL}/results/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al eliminar el resultado");
      }

      // Actualizar el estado local después de eliminar
      setUserResults((prev) => prev.filter((result) => result.id !== id));
    } catch (error) {
      console.error("❌ Error eliminando resultado:", error);
    }
  };

  return {
    userResults,
    saveResult,
    deleteResult,
    loading,
  };
}
