"use client"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type SeriesChartProps = {
  data: {
    labels: string[]
    generated: number[]
    ideal: number[]
    error: number[]
  }
}

export function SeriesChart({ data }: SeriesChartProps) {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "Valores Generados",
        data: data.generated,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.3,
      },
      {
        label: "Valores Ideales",
        data: data.ideal,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.3,
      },
      {
        label: "Error",
        data: data.error,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.3,
        hidden: true,
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
        text: "Comparación de Series",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  }

  return <Line data={chartData} options={options} />
}

