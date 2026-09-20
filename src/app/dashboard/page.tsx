"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingBag, TrendingUp, AlertCircle, Loader2, XCircle, Timer, Store, Flame, FileDown, Store as ShopIcon } from "lucide-react";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { SalesChart } from "@/components/SalesChart";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingValidations: number;
  cancelledOrders: number;
  cancellationRate: number;
  avgDeliveryHours: number;
  deliveredOrders: number;
}

interface TrendPoint {
  name: string;
  value: number;
}

interface TopSeller {
  sellerId: string;
  shopName: string;
  email: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  orderCount: number;
  shopName: string;
}

type Period = "day" | "week" | "month";

const periodLabels: Record<Period, string> = { day: "Jour", week: "Semaine", month: "Mois" };

export default function DashboardPage() {
  const [stats, setStats] = useState<StatSummary | null>(null);
  const [chartData, setChartData] = useState<TrendPoint[]>([]);
  const [roleData, setRoleData] = useState<TrendPoint[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [period, setPeriod] = useState<Period>("day");
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
        const [statsRes, trendRes, roleRes, topSellersRes, topProductsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get(`/admin/sales-trend?period=${period}`),
          api.get("/admin/user-role-distribution"),
          api.get("/admin/top-sellers?limit=5"),
          api.get("/admin/top-products?limit=5"),
        ]);
        setStats(statsRes.data);
        setChartData(trendRes.data);
        setRoleData(roleRes.data);
        setTopSellers(topSellersRes.data);
        setTopProducts(topProductsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [period]);

  useEffect(() => {
    setIsLoading(stats === null);
  }, [stats]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const avgDeliveryLabel =
    stats && stats.avgDeliveryHours > 0
      ? stats.avgDeliveryHours >= 24
        ? `${(stats.avgDeliveryHours / 24).toFixed(1)} j`
        : `${stats.avgDeliveryHours} h`
      : "—";

  const statCards = [
    { label: "Ventes Totales", value: `${stats?.totalRevenue?.toLocaleString()} F`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Commandes", value: stats?.totalOrders, icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Utilisateurs", value: stats?.totalUsers, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { label: "En attente", value: stats?.pendingValidations, icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
    { label: "Taux d'annulation", value: `${stats?.cancellationRate ?? 0}%`, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20" },
    { label: "Délai livraison moy.", value: avgDeliveryLabel, icon: Timer, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/20" },
  ];

  const roleColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400">Aperçu global de l&apos;activité OpenGaz</p>
        </div>
        <button
          onClick={() => downloadCsv("/admin/export/sales", "ventes.csv")}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <FileDown className="w-4 h-4" /> Exporter les ventes
        </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-neutral-200 dark:border-gray-800">
            <div className={`${card.bg} p-3 rounded-xl w-fit mb-4`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-neutral-200 dark:border-gray-800 h-80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Évolution des ventes</h3>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {(Object.keys(periodLabels) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    period === p ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <SalesChart data={chartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-neutral-200 dark:border-gray-800 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par rôle</h3>
          <div className="flex-1 min-h-0">
            <Pie
              data={{
                labels: roleData.map((d) => roleLabels[d.name] || d.name),
                datasets: [
                  {
                    data: roleData.map((d) => d.value),
                    backgroundColor: roleColors,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Top revendeurs</h3>
          </div>
          {topSellers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Aucune vente enregistrée.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {topSellers.map((seller, index) => (
                <div key={seller.sellerId} className="flex items-center gap-4 px-6 py-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    : index === 1 ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    : index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{seller.shopName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{seller.email} • {seller.orders} commande(s)</p>
                  </div>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{seller.revenue.toLocaleString()} F</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Produits les plus vendus</h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Aucune vente enregistrée.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {topProducts.map((product) => (
                <div key={product.productId} className="flex items-center gap-4 px-6 py-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {product.brand} • {product.shopName || "—"} • {product.orderCount} commande(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 dark:text-white">{product.quantity}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">unités</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}