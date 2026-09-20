"use client";

import { useEffect, useState } from "react";
import {
  History,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

interface ActivityEntry {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  admin: { id: string; name: string | null; email: string } | null;
}

const PAGE_SIZE = 15;

const actionMeta: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  VALIDATION: { label: "Validation", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" },
  REJECTION: { label: "Rejet", icon: XCircle, className: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
  BLOCK: { label: "Blocage", icon: ShieldOff, className: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
  UNBLOCK: { label: "Déblocage", icon: ShieldCheck, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" },
  DELETE: { label: "Suppression", icon: Trash2, className: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
  CREATE: { label: "Création", icon: Package, className: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" },
  UPDATE: { label: "Modification", icon: Save, className: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" },
  STOCK: { label: "Stock", icon: Package, className: "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400" },
};

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/admin/activity?page=${page}&pageSize=${PAGE_SIZE}`);
        if (!active) return;
        setEntries(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journal d&apos;activité</h1>
          <p className="text-gray-500 dark:text-gray-400">Toutes les actions effectuées par les administrateurs</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <History className="w-4 h-4" />
          {total} action(s)
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucune activité enregistrée.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.map((entry) => {
              const meta = actionMeta[entry.action] || { label: entry.action, icon: History, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" };
              const Icon = meta.icon;
              return (
                <div key={entry.id} className="flex items-start gap-4 px-6 py-4">
                  <div className={`p-2 rounded-lg shrink-0 ${meta.className}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {meta.label}
                      {entry.entity && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
                          {entry.entity}
                        </span>
                      )}
                    </p>
                    {entry.details && <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 break-words">{entry.details}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span>{entry.admin?.name || entry.admin?.email || "Admin"}</span>
                      <span>{new Date(entry.createdAt).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} sur {totalPages}
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
    </div>
  );
}