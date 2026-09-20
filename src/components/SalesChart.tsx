"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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
        backgroundColor: '#2563eb',
        hoverBackgroundColor: '#1d4ed8',
        borderRadius: 6,
        maxBarThickness: 48,
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
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#9ca3af',
          callback: (value: string | number) => `${value} F`,
        },
      },
    },
  };

  return (
    <div className="relative w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}