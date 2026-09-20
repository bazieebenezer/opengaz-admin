"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ClipboardCheck,
  Flame,
  Star,
  Truck,
  Store
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("adminUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  // Écouter les changements dans localStorage pour le nom (si mis à jour dans Settings)
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("adminUser");
      if (user) setAdminUser(JSON.parse(user));
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll pour les mises à jour dans la même fenêtre
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/");
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Validations", icon: ClipboardCheck, href: "/dashboard/validations" },
    { label: "Commandes", icon: ShoppingBag, href: "/dashboard/orders" },
    { label: "Utilisateurs", icon: Users, href: "/dashboard/users" },
    { label: "Produits & Gaz", icon: Flame, href: "/dashboard/products" },
    { label: "Revendeurs", icon: Store, href: "/dashboard/sellers" },
    { label: "Livraisons", icon: Truck, href: "/dashboard/deliveries" },
    { label: "Avis", icon: Star, href: "/dashboard/reviews" },
    { label: "Paramètres", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <img src="/admin-logo.png" alt="OpenGaz" className="w-8 h-8 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 font-bold text-lg text-gray-900 dark:text-white truncate">
                OpenGaz
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center p-3 rounded-xl transition-all group",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white")} />
                {isSidebarOpen && (
                  <span className="ml-3 font-medium flex-1 truncate">{item.label}</span>
                )}
                {isActive && isSidebarOpen && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className={clsx(
              "flex items-center w-full p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 font-medium">Déconnexion</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 transition-colors mr-2"
              aria-label="Changer de thème"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{adminUser?.email || ''}</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
              {adminUser?.name ? adminUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}