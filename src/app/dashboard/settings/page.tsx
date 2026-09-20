"use client";

import { useState } from "react";
import { User, Save, LayoutDashboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

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

export default function SettingsPage() {
  const [name, setName] = useState(() => getAdminUser().name || "");
  const [email] = useState(() => getAdminUser().email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("30");

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.patch("/auth/profile", { name });
      toast.success("Profil mis à jour avec succès.");
      // Update local storage
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...adminUser, name }));
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setIsLoading(false);
    }
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
