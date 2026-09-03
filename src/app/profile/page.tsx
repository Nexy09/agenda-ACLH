/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [classe, setClasse] = useState(user?.classe || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhoneNumber(user.phoneNumber);
      setClasse(user.classe || "");
    }
  }, [user]);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ firstName, lastName, phoneNumber, classe: classe.toUpperCase() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const avatarText = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto">
      <div className="w-full bg-[var(--card-bg)] rounded-[var(--radius-4xl)] p-8 shadow-sm border border-[var(--border)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-[var(--primary)]/20">
            {avatarText}
          </div>
          <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
          <p className="text-sm opacity-60">@{user.username}</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold opacity-70 ml-2">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold opacity-70 ml-2">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold opacity-70 ml-2">Numéro de téléphone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
              />
            </div>
            <div className="w-1/3 flex flex-col gap-2">
              <label className="text-sm font-semibold opacity-70 ml-2">Classe</label>
              <input
                type="text"
                placeholder="Ex: T°3"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium uppercase"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg py-4 rounded-full active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/20"
            >
              <Save size={20} />
              {isSaved ? "Sauvegardé !" : "Enregistrer"}
            </button>
            <button 
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold text-lg px-8 py-4 rounded-full active:scale-95 transition-all hover:bg-red-500/20"
            >
              <LogOut size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
