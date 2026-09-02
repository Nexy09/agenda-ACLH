"use client";

import React, { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { Phone, GraduationCap } from "lucide-react";

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { getUserById } = useAuth();
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = getUserById(params.id);
      if (u) setTargetUser(u);
    };
    fetchUser();
  }, [params.id, getUserById]);

  if (!targetUser) return (
    <div className="flex items-center justify-center h-full w-full opacity-60">
      Utilisateur introuvable.
    </div>
  );

  const avatarText = `${targetUser.firstName?.[0] || ""}${targetUser.lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="flex flex-col items-center h-full max-w-xl mx-auto pt-8">
      <div className="w-full bg-[var(--card-bg)] rounded-[var(--radius-4xl)] p-8 shadow-sm border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--primary)]/20 to-transparent opacity-50 pointer-events-none" />
        <div className="flex flex-col items-center mb-10 relative z-10 pt-4">
          <div className="w-28 h-28 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-4xl font-bold mb-4 shadow-xl shadow-[var(--primary)]/30 ring-4 ring-[var(--card-bg)]">
            {avatarText}
          </div>
          <h1 className="text-3xl font-bold mb-1">{targetUser.firstName} {targetUser.lastName}</h1>
          <p className="text-base opacity-60 font-medium">@{targetUser.username}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--background)] rounded-[var(--radius-2xl)] p-5 flex items-center gap-4 border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold opacity-60 mb-0.5">Classe</p>
              <p className="text-xl font-bold">{targetUser.classe || "Non renseignée"}</p>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-[var(--radius-2xl)] p-5 flex flex-col gap-4 border border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold opacity-60 mb-0.5">Numéro de téléphone</p>
                <p className="text-xl font-bold font-mono">{targetUser.phoneNumber || "Non renseigné"}</p>
              </div>
            </div>
            {targetUser.phoneNumber && (
              <a 
                href={`tel:${targetUser.phoneNumber}`}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-500/20 mt-2"
              >
                <Phone size={20} className="fill-current" />
                Appeler
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
