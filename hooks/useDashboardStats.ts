// /hooks/useDashboardStats.ts
"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"

type DashboardData = {
  total_users: number
  users: any[]
  users_yesterday: number
  total_users_growth: number
  total_series_generated?: number
  global_avg_error?: number
  error_change?: number
  series_growth?: number
  top_performing_users?: { name: string; email: string; avg_error: number }[]
  high_error_series?: { type: string; count: number; avg_error: number }[]
  series_stats?: Record<
    string,
    {
      count: number
      avg_error: number
      max_error: number
    }
  >
  // agrega aquí todos los campos extra que guardes en "stats"
}

export function useDashboardStats() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Referencia al doc "dashboard/stats"
    const docRef = doc(db, "dashboard", "stats")

    // Suscribirse con onSnapshot
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        // Actualizar estado con los datos
        setDashboard(snapshot.data() as DashboardData)
      } else {
        // Si no existe el doc, ponemos null
        setDashboard(null)
      }
      setLoading(false)
    })

    // Cleanup
    return () => unsubscribe()
  }, [])

  return { dashboard, loading }
}
