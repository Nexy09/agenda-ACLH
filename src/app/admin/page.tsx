/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trash2, Pencil, X, Save } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const { user, getAllUsers, loginAsUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/");
    } else if (user?.isAdmin) {
      setUsers(getAllUsers());
    }
  }, [user, router, getAllUsers]);

  if (!user?.isAdmin) return null;

  const handleDelete = async (targetId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action supprimera son profil de l'agenda.")) return;
    try {
      await deleteDoc(doc(db, "users", targetId));
      setUsers(users.filter((u) => u.id !== targetId));
    } catch (e) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const { id, ...data } = editingUser;
      await updateDoc(doc(db, "users", id), data);
      setUsers(users.map((u) => u.id === id ? editingUser : u));
      setEditingUser(null);
    } catch (e) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-3xl font-bold">Administration</h1>
      </div>

      <div className="bg-[var(--card-bg)] rounded-[var(--radius-4xl)] shadow-sm border border-[var(--border)] overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">Comptes Utilisateurs</h2>
          <p className="text-sm opacity-70 mt-1">Liste de tous les comptes enregistrés sur la plateforme.</p>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-3">
            {users.length === 0 ? (
              <div className="p-6 text-center opacity-60">Aucun utilisateur enregistré.</div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-[var(--radius-2xl)] bg-[var(--background)] border border-[var(--border)] flex-wrap sm:flex-nowrap">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-lg shrink-0">
                    {u.firstName?.[0] || ""}{u.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <h3 className="font-bold">{u.firstName} {u.lastName} {u.isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-1 align-middle">Admin</span>}</h3>
                    <p className="text-sm opacity-70">@{u.username} • {u.classe || "Sans classe"}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                    <div className="text-right hidden sm:block mr-2">
                      <p className="font-mono text-sm">{u.phoneNumber || "N/A"}</p>
                      <p className="text-xs opacity-50 mt-1">ID: {u.id.substring(0, 8)}...</p>
                    </div>
                    {u.id !== user.id && (
                      <button
                        onClick={() => loginAsUser(u.id)}
                        className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold rounded-full hover:bg-[var(--primary)]/20 active:scale-95 transition-all text-sm whitespace-nowrap"
                        title="Se connecter en tant que"
                      >
                        Se connecter
                      </button>
                    )}
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-full hover:bg-blue-500/20 transition-all active:scale-95"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-all active:scale-95"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-3xl)] w-full max-w-md p-6 shadow-xl border border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 bg-[var(--background)] rounded-full hover:bg-[var(--border)] transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6">Modifier l'utilisateur</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold opacity-70 mb-1 block">Prénom</label>
                <input 
                  type="text" 
                  value={editingUser.firstName} 
                  onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold opacity-70 mb-1 block">Nom</label>
                <input 
                  type="text" 
                  value={editingUser.lastName} 
                  onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold opacity-70 mb-1 block">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  value={editingUser.username} 
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold opacity-70 mb-1 block">Classe</label>
                <input 
                  type="text" 
                  value={editingUser.classe || ""} 
                  onChange={(e) => setEditingUser({...editingUser, classe: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold opacity-70 mb-1 block">Téléphone</label>
                <input 
                  type="text" 
                  value={editingUser.phoneNumber || ""} 
                  onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2"
                />
              </div>
              <label className="flex items-center gap-3 bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={editingUser.isAdmin || false} 
                  onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                  className="w-5 h-5 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                <span className="font-semibold">Droits Administrateur</span>
              </label>
              
              <button 
                type="submit"
                className="w-full mt-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Save size={20} />
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
