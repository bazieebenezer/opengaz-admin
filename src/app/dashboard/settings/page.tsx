"use client";

import { useState } from "react";
import { User, Save, LayoutDashboard, Loader2, Lock, Bell } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : fallback;
}

function getAdminUser(): { name?: string; email?: string } {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("adminUser");
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function getPref(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored === "true";
}

export default function SettingsPage() {
  const [name, setName] = useState(() => getAdminUser().name || "");
  const [email] = useState(() => getAdminUser().email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("30");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notifyNewOrders, setNotifyNewOrders] = useState(() => getPref("adminPref_notifyNewOrders", true));
  const [notifyLowStock, setNotifyLowStock] = useState(() => getPref("adminPref_notifyLowStock", true));
  const [notifyNewSellers, setNotifyNewSellers] = useState(() => getPref("adminPref_notifyNewSellers", false));

  const setPref = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.patch("/auth/profile", { name });
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...adminUser, name }));
      toast.success("Profil mis à jour avec succès.");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await api.post("/admin/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success(response.data.message || "Mot de passe modifié.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors du changement de mot de passe."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSelectChange = (
    key: string,
    setter: (value: boolean) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setter(value);
    setPref(key, value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400">Gérez votre profil administrateur et les préférences du dashboard</p>
      </div>

      {/* Profil Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <User size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profil Administrateur</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sécurité Section */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg">
            <Lock size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sécurité</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Au moins 6 caractères"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
            Changer le mot de passe
          </button>
        </div>
      </form>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Bell size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              key: "adminPref_notifyNewOrders",
              label: "Nouvelles commandes",
              description: "Alerter à la réception de nouvelles commandes",
              value: notifyNewOrders,
              setter: setNotifyNewOrders,
            },
            {
              key: "adminPref_notifyLowStock",
              label: "Stocks faibles",
              description: "Alerter lorsque le stock d'un produit est en rupture",
              value: notifyLowStock,
              setter: setNotifyLowStock,
            },
            {
              key: "adminPref_notifyNewSellers",
              label: "Nouveaux revendeurs",
              description: "Alerter à l'inscription de nouveaux revendeurs",
              value: notifyNewSellers,
              setter: setNotifyNewSellers,
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={handleSelectChange(item.key, item.setter)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Gestion Dashboard */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gestion Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intervalle rafraîchissement (secondes)</label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}