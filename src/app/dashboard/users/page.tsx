"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon, Loader2, Search, Shield, ShieldOff, Trash2, Mail, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : fallback;
}

const roleLabels: Record<string, string> = {
  DELIVERY: "Livreur",
  SELLER: "Revendeur",
  CONSUMER: "Client",
  ADMIN: "Admin",
};

const roleColors: Record<string, string> = {
  DELIVERY: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  SELLER: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  CONSUMER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
};

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  shopName: string | null;
  isShopOpen: boolean;
  isValidated: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (roleFilter !== "ALL") params.set("role", roleFilter);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await api.get(`/admin/users${query}`);
        if (!active) return;
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Impossible de charger les utilisateurs.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [search, roleFilter]);

  const handleToggleBlock = async (user: AdminUser) => {
    setProcessingId(user.id);
    try {
      const response = await api.patch(`/admin/users/${user.id}/block`);
      toast.success(response.data.message || "Compte mis à jour.");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: response.data.isBlocked } : u)));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${user.name || user.email} ?`)) return;
    setProcessingId(user.id);
    try {
      const response = await api.delete(`/admin/users/${user.id}`);
      toast.success(response.data.message || "Utilisateur supprimé.");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la suppression."));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-500 dark:text-gray-400">Recherchez, filtrez et gérez tous les comptes de la plateforme</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <UsersIcon className="w-4 h-4" />
          {users.length} utilisateur(s)
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, boutique..."
            className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 px-4 py-2.5 outline-none cursor-pointer"
        >
          <option value="ALL">Tous les rôles</option>
          <option value="CONSUMER">Clients</option>
          <option value="SELLER">Revendeurs</option>
          <option value="DELIVERY">Livreurs</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4 hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Statut</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Inscription</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-xs shrink-0">
                          {(user.name || user.email).split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name || "—"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone || "—"}
                      </p>
                      {user.shopName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[160px]">{user.shopName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[user.role] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className={user.isBlocked ? "text-red-600 dark:text-red-400 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                          {user.isBlocked ? "Bloqué" : "Actif"}
                        </span>
                        {!user.isValidated && user.role !== "ADMIN" && (
                          <span className="text-orange-500 dark:text-orange-400">Non validé</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "ADMIN" && (
                          <>
                            <button
                              onClick={() => handleToggleBlock(user)}
                              disabled={processingId === user.id}
                              title={user.isBlocked ? "Débloquer" : "Bloquer"}
                              className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                                user.isBlocked
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                              }`}
                            >
                              {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isBlocked ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={processingId === user.id}
                              title="Supprimer"
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}