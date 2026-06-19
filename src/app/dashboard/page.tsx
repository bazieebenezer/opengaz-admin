"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingBag, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { SalesChart } from "@/components/SalesChart";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roleLabels: Record<string, string> = {
    DELIVERY: "Livreur",
    SELLER: "Revendeur",
    CONSUMER: "Client",
    ADMIN: "Administrateur",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, trendRes, roleRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/sales-trend"),
          api.get("/admin/user-role-distribution")
        ]);
        setStats(statsRes.data);
        setChartData(trendRes.data);
        setRoleData(roleRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    { label: "Ventes Totales", value: `${stats?.totalRevenue?.toLocaleString()} F`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-450", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Commandes", value: stats?.totalOrders, icon: ShoppingBag, color: "text-blue-600 dark:text-blue-450", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Utilisateurs", value: stats?.totalUsers, icon: Users, color: "text-purple-600 dark:text-purple-450", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { label: "En attente", value: stats?.pendingValidations, icon: AlertCircle, color: "text-orange-600 dark:text-orange-450", bg: "bg-orange-50 dark:bg-orange-950/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-500 dark:text-gray-400">Aperçu global de l&apos;activité OpenGaz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-neutral-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-neutral-200 dark:border-gray-800 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Évolution des ventes</h3>
          <div className="flex-1 min-h-0">
            <SalesChart data={chartData} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-neutral-200 dark:border-gray-800 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par rôle</h3>
          <div className="flex-1 min-h-0">
            <Pie data={{
                labels: roleData.map(d => roleLabels[d.name] || d.name),
                datasets: [{
                    data: roleData.map(d => d.value),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
