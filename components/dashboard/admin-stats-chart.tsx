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
  type ChartData,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function AdminStatsChart() {
  const chartData: ChartData<"bar"> = {
    labels: ["Seno", "Coseno", "Tangente", "Personalizada"],
    datasets: [
      {
        label: "Error Promedio",
        data: [0.0022, 0.0025, 0.0038, 0.0031],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
      {
        label: "Desviación Estándar",
        data: [0.0008, 0.0011, 0.0015, 0.0013],
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
      {
        label: "Error Máximo",
        data: [0.0076, 0.0082, 0.0124, 0.0098],
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
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

