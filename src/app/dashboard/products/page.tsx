"use client";

import { useEffect, useState } from "react";
import { Loader2, Flame, Package, Plus, Pencil, Trash2, Save, X, Minus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

interface GasCategory {
  id: string;
  name: string;
  brand: string;
  weight: number;
  price: number;
  imageUrl: string;
  _count: { products: number };
}

interface ProductRow {
  id: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; brand: string; weight: number; price: number };
  seller: { id: string; shopName: string | null; name: string | null; email: string };
}

type Tab = "categories" | "produits";

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : fallback;
}

const emptyForm = { id: "", name: "", brand: "", weight: "", price: "", imageUrl: "" };

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [categories, setCategories] = useState<GasCategory[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  const loadCategories = async () => {
    const res = await api.get("/admin/gas-categories");
    setCategories(res.data);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/admin/gas-categories"),
          api.get("/admin/products"),
        ]);
        if (!active) return;
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Failed to load products data", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: GasCategory) => {
    setEditingId(cat.id);
    setForm({
      id: cat.id,
      name: cat.name,
      brand: cat.brand,
      weight: String(cat.weight),
      price: String(cat.price),
      imageUrl: cat.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/admin/gas-categories/${editingId}`, {
          name: form.name,
          brand: form.brand,
          weight: form.weight,
          price: form.price,
          imageUrl: form.imageUrl,
        });
        toast.success("Catégorie mise à jour.");
      } else {
        await api.post("/admin/gas-categories", form);
        toast.success("Catégorie créée.");
      }
      await loadCategories();
      setShowForm(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de l'enregistrement."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: GasCategory) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return;
    try {
      const res = await api.delete(`/admin/gas-categories/${cat.id}`);
      toast.success(res.data.message || "Catégorie supprimée.");
      await loadCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la suppression."));
    }
  };

  const handleStockChange = async (product: ProductRow, delta: number) => {
    const next = Math.max(0, product.stock + delta);
    try {
      const res = await api.patch(`/admin/products/${product.id}/stock`, { stock: next });
      toast.success(res.data.message || "Stock mis à jour.");
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: res.data.product.stock } : p)));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour du stock."));
    }
  };

  const handleStockSubmit = async (product: ProductRow) => {
    const value = parseInt(stockEdits[product.id] ?? "");
    if (isNaN(value) || value < 0) return;
    try {
      const res = await api.patch(`/admin/products/${product.id}/stock`, { stock: value });
      toast.success("Stock mis à jour.");
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: res.data.product.stock } : p)));
      setStockEdits((prev) => ({ ...prev, [product.id]: "" }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour du stock."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produits & Gaz</h1>
          <p className="text-gray-500 dark:text-gray-400">Catégories de gaz et stocks disponible</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${tab === "categories" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <Flame className="w-4 h-4" /> Catégories
          </button>
          <button
            onClick={() => setTab("produits")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${tab === "produits" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <Package className="w-4 h-4" /> Stocks
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tab === "categories" ? (
        <div className="space-y-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">ID (ex: sodigaz-6)</label>
                  <input
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    disabled={!!editingId}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Nom</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Marque</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Prix (F)</label>
                  <input
                    type="number"
                    step="50"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">URL image</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-end">
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Nouvelle catégorie
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-neutral-200 dark:border-gray-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Flame className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{cat.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cat.brand} • {cat.weight} kg
                  </p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{cat.price.toLocaleString()} F</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{cat._count.products} produit(s)</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 transition-colors cursor-pointer">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-200 dark:border-gray-800 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucun produit en base.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4">Boutique</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4">Dernière MAJ</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{product.category.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category.brand} • {product.category.price.toLocaleString()} F</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.seller.shopName || product.seller.name || "—"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.seller.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {stockEdits[product.id] !== undefined && stockEdits[product.id] !== "" ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={stockEdits[product.id]}
                              onChange={(e) => setStockEdits({ ...stockEdits, [product.id]: e.target.value })}
                              className="w-20 px-2 py-1 border border-blue-300 dark:border-blue-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-center"
                            />
                            <button onClick={() => handleStockSubmit(product)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer">
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleStockChange(product, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 cursor-pointer">
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStockEdits({ ...stockEdits, [product.id]: String(product.stock) })}
                              className={`min-w-[48px] px-2 py-1 rounded-lg text-center font-bold cursor-pointer ${product.stock === 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
                              title="Cliquer pour modifier"
                            >
                              {product.stock}
                            </button>
                            <button onClick={() => handleStockChange(product, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(product.updatedAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleStockChange(product, 10)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 text-xs font-bold cursor-pointer">
                          +10 stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}