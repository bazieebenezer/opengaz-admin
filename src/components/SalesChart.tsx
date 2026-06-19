"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: ChartData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: 'Ventes (F)',
        data: data.map((item) => item.value),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#9ca3af',
          callback: (value: any) => `${value}F`,
        },
      },
    },
  };

  return (
    <div className="relative w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
