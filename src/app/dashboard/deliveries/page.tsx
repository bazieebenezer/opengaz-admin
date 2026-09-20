"use client";

import { useEffect, useState } from "react";
import { Loader2, Truck, Package, MapPin, Phone, Route } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Deliverer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  deliveredCount: number;
  completedCount: number;
  inDeliveryCount: number;
  cancelledCount: number;
}

interface Delivery {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  address: string | null;
  deliverer: { id: string; name: string | null; email: string; phone: string | null } | null;
  consumer: { id: string; name: string | null; address: string | null; phone: string | null };
  seller: { id: string; shopName: string | null };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { id: string; stock: number; category: { id: string; name: string; brand: string } };
  }[];
}

const statusBadges: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  CONFIRMED: { label: "Confirmée", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  IN_DELIVERY: { label: "En livraison", className: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  DELIVERED: { label: "Livrée", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  COMPLETED: { label: "Terminée", className: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
};

export default function DeliveriesPage() {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadedDeliverers, setLoadedDeliverers] = useState(false);
  const [loadedDeliveries, setLoadedDeliveries] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await api.get("/admin/deliverers");
        if (!active) return;
        setDeliverers(response.data);
        setLoadedDeliverers(true);
      } catch (error) {
        console.error("Failed to fetch deliverers", error);
        toast.error("Impossible de charger les livreurs.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await api.get("/admin/deliveries");
        if (!active) return;
        setDeliveries(response.data);
        setLoadedDeliveries(true);
      } catch (error) {
        console.error("Failed to fetch deliveries", error);
        toast.error("Impossible de charger les livraisons.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isLoading = !loadedDeliverers || !loadedDeliveries;
  const activeDeliveries = deliveries.filter((d) => ["CONFIRMED", "IN_DELIVERY"].includes(d.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi des livreurs</h1>
        <p className="text-gray-500 dark:text-gray-400">Statistiques des livreurs et livraisons en cours</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {activeDeliveries.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 flex items-center gap-3">
              <Route className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold text-blue-700 dark:text-blue-300">{activeDeliveries.length} livraison(s) en cours</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                  {activeDeliveries.map((d) => d.deliverer?.name || "non assigné").join(", ")}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deliverers.map((deliverer) => (
              <div key={deliverer.id} className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{deliverer.name || "Livreur"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{deliverer.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5" /> {deliverer.phone || "—"}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3">
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{deliverer.completedCount + deliverer.deliveredCount}</p>
                    <p className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase">Livrées</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3">
                    <p className="font-extrabold text-orange-600 dark:text-orange-400">{deliverer.inDeliveryCount}</p>
                    <p className="text-[10px] font-semibold text-orange-600/70 dark:text-orange-400/70 uppercase">En cours</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                    <p className="font-extrabold text-red-600 dark:text-red-400">{deliverer.cancelledCount}</p>
                    <p className="text-[10px] font-semibold text-red-600/70 dark:text-red-400/70 uppercase">Annulées</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Livraisons ({deliveries.length})</h2>
            </div>
            {deliveries.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucune livraison assignée.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-4">Commande</th>
                      <th className="px-6 py-4">Livreur</th>
                      <th className="px-6 py-4 hidden md:table-cell">Client</th>
                      <th className="px-6 py-4 hidden lg:table-cell">Destination</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {deliveries.map((delivery) => {
                      const badge = statusBadges[delivery.status] || statusBadges.PENDING;
                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 dark:text-white">#{delivery.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                              {delivery.items.map((i) => `${i.quantity}× ${i.product.category.name}`).join(", ")}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-800 dark:text-gray-200">{delivery.deliverer?.name || "Non assigné"}</p>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-gray-700 dark:text-gray-300">{delivery.consumer.name || "—"}</p>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 max-w-[180px] truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0" /> {delivery.consumer.address || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.className}`}>{badge.label}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                            {delivery.totalAmount.toLocaleString()} F
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}