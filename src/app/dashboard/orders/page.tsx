"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { Loader2, Filter, Search, FileDown, Eye, X, ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";

const PAGE_SIZE = 20;

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PREPARING: "En préparation",
  READY_FOR_DELIVERY: "Prête",
  IN_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  PREPARING: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  READY_FOR_DELIVERY: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  IN_DELIVERY: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  COMPLETED: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

interface OrderRow {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  consumer: { name?: string; email?: string } | null;
  seller: { shopName?: string } | null;
  deliverer: { name?: string } | null;
  items: { product: { category: { name: string } } }[];
}

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  consumer: { name?: string; email?: string; phone?: string; address?: string } | null;
  seller: { shopName?: string; name?: string; email?: string; phone?: string; address?: string } | null;
  deliverer: { name?: string; email?: string; phone?: string } | null;
  items: { quantity: number; price: number; product: { stock: number; category: { name: string; brand: string; weight: number } } }[];
  review: { rating: number; comment?: string; createdAt: string } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        const response = await api.get(`/admin/orders?${params.toString()}`);
        if (!active) return;
        setOrders(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [statusFilter, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setDetail(null);
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setDetail(response.data.order);
    } catch (error) {
      console.error("Failed to fetch order detail", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
          <p className="text-gray-500 dark:text-gray-400">Liste et suivi de toutes les commandes OpenGaz</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadCsv("/admin/export/orders", "commandes.csv")}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" /> Exporter CSV
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-2" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="" className="dark:bg-gray-900">Tous les statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value} className="dark:bg-gray-900">{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par ID, client, boutique..."
          className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Commande</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Vendeur</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Aucune commande trouvée.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.consumer?.name || order.consumer?.email || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.seller?.shopName || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                        {order.totalAmount.toLocaleString()} F
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(order.id)}
                          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 transition-colors cursor-pointer"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orders.length > 0 ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} sur ${total}` : "0 résultat"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4 sm:p-8" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Commande #{detail.id.slice(0, 8)}
                <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[detail.status] || "bg-gray-100 text-gray-800"}`}>
                  {statusLabels[detail.status] || detail.status}
                </span>
              </h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Client</p>
                  <p className="font-medium text-gray-900 dark:text-white">{detail.consumer?.name || "—"}</p>
                  <p className="text-gray-500 dark:text-gray-400">{detail.consumer?.email || "—"} • {detail.consumer?.phone || "—"}</p>
                  {detail.consumer?.address && (
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {detail.consumer.address}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Boutique</p>
                  <p className="font-medium text-gray-900 dark:text-white">{detail.seller?.shopName || detail.seller?.name || "—"}</p>
                  <p className="text-gray-500 dark:text-gray-400">{detail.seller?.phone || "—"}</p>
                  {detail.seller?.address && (
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {detail.seller.address}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Livreur</p>
                  <p className="font-medium text-gray-900 dark:text-white">{detail.deliverer?.name || "Non assigné"}</p>
                  <p className="text-gray-500 dark:text-gray-400">{detail.deliverer?.phone || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Articles</p>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-center">Qté</th>
                        <th className="px-4 py-2 text-right">Prix</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {detail.items.map((item) => (
                        <tr key={`${item.product.category.name}-${item.price}`}>
                          <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                            {item.product.category.name}
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {item.product.category.brand} • {item.product.category.weight} kg
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{item.price.toLocaleString()} F</td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {detail.review && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= detail.review!.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                    ))}
                  </div>
                  {detail.review.comment && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">« {detail.review.comment} »</p>}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>Créée le {new Date(detail.createdAt).toLocaleString("fr-FR")}</p>
                  {detail.deliveredAt && <p>Livrée le {new Date(detail.deliveredAt).toLocaleString("fr-FR")}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{detail.totalAmount.toLocaleString()} F</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
}