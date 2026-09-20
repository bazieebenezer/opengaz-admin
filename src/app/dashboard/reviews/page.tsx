"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Trash2, MessageSquare, Store } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

function getErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : fallback;
}

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  seller: { id: string; shopName: string | null; name: string | null };
  consumer: { id: string; name: string | null; email: string };
  order: { id: string; status: string; totalAmount: number } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/reviews");
        if (!active) return;
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        toast.error("Impossible de charger les avis.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (review: AdminReview) => {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    setDeletingId(review.id);
    try {
      const response = await api.delete(`/admin/reviews/${review.id}`);
      toast.success(response.data.message || "Avis supprimé.");
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la suppression."));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = ratingFilter ? reviews.filter((r) => r.rating === ratingFilter) : reviews;
  const average = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modération des avis</h1>
          <p className="text-gray-500 dark:text-gray-400">Consultez et supprimez les avis clients</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-900 dark:text-white">{average.toFixed(1)}</span>
            <span className="text-gray-400">/ 5</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer border ${
              ratingFilter === rating
                ? "bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-700"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-amber-300"
            }`}
          >
            {rating} <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{filtered.length} avis</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">Aucun avis{ratingFilter ? ` noté ${ratingFilter} étoile(s)` : ""}.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-neutral-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(review.consumer.name || review.consumer.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{review.consumer.name || review.consumer.email}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review)}
                  disabled={deletingId === review.id}
                  className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  title="Supprimer l'avis"
                >
                  {deletingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>

              {review.comment ? (
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">« {review.comment} »</p>
              ) : (
                <p className="mt-4 text-sm text-gray-400 italic">Aucun commentaire.</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" /> {review.seller.shopName || review.seller.name || "Boutique"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> {review.order ? `${review.order.totalAmount.toLocaleString()} F` : "Commande supprimée"}
                </span>
                <span>{new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}