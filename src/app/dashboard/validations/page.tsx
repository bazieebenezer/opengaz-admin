"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Store, 
  Truck, 
  Eye,
  EyeOff, 
  Loader2,
  Calendar,
  Phone,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const roleLabels: Record<string, string> = {
  DELIVERY: "LIVREUR",
  SELLER: "REVENDEUR",
  CONSUMER: "CLIENT",
  ADMIN: "ADMINISTRATEUR",
};

export default function ValidationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [validatedUsers, setValidatedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    try {
      const [pendingRes, validatedRes] = await Promise.all([
        api.get("/admin/pending-users"),
        api.get("/admin/validated-delivery-partners")
      ]);
      setUsers(pendingRes.data);
      setValidatedUsers(validatedRes.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    try {
      await api.post(`/admin/validate-user/${id}`, { action });
      toast.success(`Utilisateur ${action === 'APPROVE' ? 'validé' : 'rejeté'} avec succès.`);
      await fetchUsers(); // Refresh both lists
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (error) {
      toast.error("Une erreur est survenue lors du traitement.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validations</h1>
        <p className="text-gray-505 dark:text-gray-400">Gérez les validations et accédez aux accès des livreurs</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Liste des utilisateurs */}
        <div className="xl:col-span-2 space-y-8">
          {/* Pendings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">En attente</h2>
            {users.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-400 dark:text-gray-500">Aucune validation en attente.</p>
              </div>
            ) : (
              users.map((user) => (
                <div 
                  key={user.id}
                  className={`bg-white dark:bg-gray-900 p-6 rounded-2xl border transition-all cursor-pointer ${
                    selectedUser?.id === user.id ? "border-blue-500 dark:border-blue-400" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${user.role === 'DELIVERY' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}>
                        {user.role === 'DELIVERY' ? <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" /> : <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-gray-505 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'DELIVERY' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      }`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                      <Eye size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Validés */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Livreurs validés</h2>
            {validatedUsers.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-400 dark:text-gray-500">Aucun livreur validé pour le moment.</p>
              </div>
            ) : (
              validatedUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-505 dark:text-gray-400">{user.phone} • {user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                      {visiblePasswords[user.id] ? user.temporaryPassword : "****"}
                    </span>
                    <button 
                      onClick={() => setVisiblePasswords({...visiblePasswords, [user.id]: !visiblePasswords[user.id]})}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {visiblePasswords[user.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Détails et Actions */}
        <div className="space-y-6">
          {selectedUser ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-8">
              <div className="bg-gray-50 dark:bg-gray-950 p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Détails du dossier</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1 font-bold">Inscrit le {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedUser.address}</span>
                  </div>
                </div>

                {selectedUser.role === 'DELIVERY' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Documents (CNIB)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {selectedUser.cnibRecto ? (
                          <img src={selectedUser.cnibRecto} alt="CNIB Recto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500">RECTO MANQUANT</div>
                        )}
                      </div>
                      <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {selectedUser.cnibVerso ? (
                          <img src={selectedUser.cnibVerso} alt="CNIB Verso" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500">VERSO MANQUANT</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.role === 'SELLER' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Boutique</p>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                       <img src={selectedUser.shopImage} alt="Shop" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.shopName}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    disabled={processingId !== null}
                    onClick={() => handleAction(selectedUser.id, 'APPROVE')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {processingId === selectedUser.id ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 size={18} />}
                    Valider
                  </button>
                  <button 
                    disabled={processingId !== null}
                    onClick={() => handleAction(selectedUser.id, 'REJECT')}
                    className="flex-1 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/55 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle size={18} />
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/40 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400 dark:text-gray-500 sticky top-8">
              Sélectionnez un utilisateur en attente pour voir ses détails et valider son accès.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
