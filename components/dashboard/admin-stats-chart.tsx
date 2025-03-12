"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js"

// Registra los componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type SeriesStats = {
  [key: string]: {
    count: number
    avg_error: number
    max_error: number
    // std_dev?: number // si tuvieras ese campo
  }
}

interface AdminStatsChartProps {
  seriesStats: SeriesStats
}

export function AdminStatsChart({ seriesStats }: AdminStatsChartProps) {
  // Convertimos 'seriesStats' en arreglos para ChartJS
  const labels = Object.keys(seriesStats) // ["Seno", "Coseno", "Tangente", "Personalizada", ...]

  // data1 = avg_error, data2 = ? (desviación), data3 = max_error
  const avgErrors = labels.map((label) => seriesStats[label].avg_error)
  const maxErrors = labels.map((label) => seriesStats[label].max_error)
  // Si tuvieras std_dev, lo mapearías también
  // const stdDevs = labels.map((label) => seriesStats[label].std_dev ?? 0)

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Error Promedio",
        data: avgErrors,
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
      {
        label: "Error Máximo",
        data: maxErrors,
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
      // Si tuvieras std_dev
      // {
      //   label: "Desviación Estándar",
      //   data: stdDevs,
      //   backgroundColor: "rgba(34, 197, 94, 0.7)",
      // },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Estadísticas por Tipo de Serie",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valor de Error",
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
