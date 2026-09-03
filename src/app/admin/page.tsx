/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  const { user, getAllUsers, loginAsUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/");
    } else if (user?.isAdmin) {
      setUsers(getAllUsers());
    }
  }, [user, router, getAllUsers]);

  if (!user?.isAdmin) return null;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
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
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-[var(--radius-2xl)] bg-[var(--background)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-lg">
                    {u.firstName?.[0] || ""}{u.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{u.firstName} {u.lastName}</h3>
                    <p className="text-sm opacity-70">@{u.username} • {u.classe || "Sans classe"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-mono text-sm">{u.phoneNumber || "N/A"}</p>
                      <p className="text-xs opacity-50 mt-1">ID: {u.id}</p>
                    </div>
                    {u.id !== user.id && (
                      <button
                        onClick={() => loginAsUser(u.id)}
                        className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold rounded-full hover:bg-[var(--primary)]/20 active:scale-95 transition-all text-sm whitespace-nowrap"
                      >
                        Se connecter
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

