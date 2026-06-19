"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Search, Filter } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PREPARING: "En préparation",
  SHIPPED: "Expédié",
  DELIVERED: "Livré",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  PREPARING: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  DELIVERED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/orders${statusFilter ? `?status=${statusFilter}` : ""}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
          <p className="text-gray-500 dark:text-gray-400">Liste et suivi de toutes les commandes OpenGaz</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
          <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-2" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none"
          >
            <option value="" className="dark:bg-gray-900">Tous les statuts</option>
            <option value="PENDING" className="dark:bg-gray-900">En attente</option>
            <option value="PREPARING" className="dark:bg-gray-900">En préparation</option>
            <option value="SHIPPED" className="dark:bg-gray-900">Expédié</option>
            <option value="DELIVERED" className="dark:bg-gray-900">Livré</option>
            <option value="COMPLETED" className="dark:bg-gray-900">Terminé</option>
            <option value="CANCELLED" className="dark:bg-gray-900">Annulé</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Vendeur</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Montant</th>
              <th className="px-6 py-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Aucune commande trouvée.</td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.consumer?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.seller?.shopName || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    {order.totalAmount.toLocaleString()} F
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
