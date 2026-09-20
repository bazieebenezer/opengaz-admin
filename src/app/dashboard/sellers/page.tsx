"use client";

import { useEffect, useState } from "react";
import { Loader2, Store, Star, MapPin, Phone, CircleDollarSign, Shield, ShieldOff, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : fallback;
}

interface AdminSeller {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  shopName: string | null;
  shopImage: string | null;
  description: string | null;
  address: string | null;
  region: string | null;
  isShopOpen: boolean;
  isValidated: boolean;
  isBlocked: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
  totalRevenue: number;
  _count: { products: number; sellerOrders: number };
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/sellers");
        if (!active) return;
        setSellers(response.data);
      } catch (error) {
        console.error("Failed to fetch sellers", error);
        toast.error("Impossible de charger les revendeurs.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateSeller = (id: string, patch: Record<string, unknown>) =>
    setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const handleToggleOpen = async (seller: AdminSeller) => {
    setProcessingId(seller.id);
    try {
      const response = await api.patch(`/admin/sellers/${seller.id}`, { isShopOpen: !seller.isShopOpen });
      toast.success(response.data.message || "Boutique mise à jour.");
      updateSeller(seller.id, { isShopOpen: !seller.isShopOpen });
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleBlock = async (seller: AdminSeller) => {
    setProcessingId(seller.id);
    try {
      const response = await api.patch(`/admin/users/${seller.id}/block`);
      toast.success(response.data.message || "Compte mis à jour.");
      updateSeller(seller.id, { isBlocked: response.data.isBlocked });
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour."));
    } finally {
      setProcessingId(null);
    }
  };

  const validSellers = sellers.filter((s) => s.isValidated);
  const blockedSellers = sellers.filter((s) => s.isBlocked);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des revendeurs</h1>
          <p className="text-gray-500 dark:text-gray-400">Boutiques partenaires, notes et performances</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <Store className="w-4 h-4" /> {validSellers.length} actifs
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold flex items-center gap-1.5">
            <ShieldOff className="w-4 h-4" /> {blockedSellers.length} bloqués
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucun revendeur enregistré.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden ${
                seller.isBlocked ? "opacity-70" : ""
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-extrabold shrink-0 overflow-hidden">
                    {seller.shopImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={seller.shopImage} alt={seller.shopName || "Boutique"} className="w-full h-full object-cover" />
                    ) : (
                      (seller.shopName || seller.name || "S").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 dark:text-white truncate">{seller.shopName || "Boutique"}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{seller.name || seller.email}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(seller.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{seller.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({seller.reviewCount})</span>
                  {!seller.isValidated && (
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                      NON VALIDÉ
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2rem]">{seller.description || "Aucune description."}</p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {seller.region && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {seller.region}
                    </span>
                  )}
                  {seller.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {seller.phone}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5">
                    <p className="font-extrabold text-gray-900 dark:text-white text-sm">{seller._count.products}</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase flex items-center justify-center gap-1">
                      <Package className="w-3 h-3" /> Produits
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5">
                    <p className="font-extrabold text-gray-900 dark:text-white text-sm">{seller._count.sellerOrders}</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Ventes
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5 col-span-2">
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {(seller.totalRevenue / 1000).toFixed(0)}
                      <span className="text-[10px] font-semibold">k F</span>
                    </p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase flex items-center justify-center gap-1">
                      <CircleDollarSign className="w-3 h-3" /> Revenus
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleOpen(seller)}
                    disabled={processingId === seller.id || seller.isBlocked}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                      seller.isShopOpen
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {seller.isShopOpen ? "Boutique ouverte" : "Boutique fermée"}
                  </button>
                  <button
                    onClick={() => handleToggleBlock(seller)}
                    disabled={processingId === seller.id}
                    title={seller.isBlocked ? "Débloquer" : "Bloquer"}
                    className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0 ${
                      seller.isBlocked
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                    }`}
                  >
                    {processingId === seller.id ? <Loader2 className="w-4 h-4 animate-spin" /> : seller.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}