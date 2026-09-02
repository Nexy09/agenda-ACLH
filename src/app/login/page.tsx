"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [classe, setClasse] = useState("");
  
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isLogin) {
      const success = await login(username, password);
      if (!success) setError("Nom d'utilisateur ou mot de passe incorrect.");
    } else {
      if (!firstName || !lastName || !username || !password || !phoneNumber || !classe) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      
      const classeRegex = /^(2°|1°|T°).+$/i;
      if (!classeRegex.test(classe)) {
        setError("La classe doit commencer par 2°, 1° ou T° (ex: 2°X, 1°X, T°X)");
        return;
      }

      const success = await register({ username, firstName, lastName, phoneNumber, classe: classe.toUpperCase() }, password);
      if (!success) setError("Ce nom d'utilisateur est déjà pris ou invalide.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md bg-[var(--card-bg)] p-8 rounded-[var(--radius-4xl)] shadow-lg border border-[var(--border)]">
        <h1 className="text-3xl font-bold text-center mb-8">{isLogin ? "Connexion" : "Inscription"}</h1>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-[1.25rem] mb-6 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                />
              </div>
              <div className="flex gap-4">
                <input
                  type="tel"
                  placeholder="Numéro de tél."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                />
                <input
                  type="text"
                  placeholder="Classe (ex: 2°X)"
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-1/3 bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                />
              </div>
            </>
          )}

          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
          />

          <button 
            type="submit"
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg py-4 rounded-full active:scale-95 transition-transform mt-4 shadow-lg shadow-[var(--primary)]/20"
          >
            {isLogin ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="w-full mt-6 text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
        >
          {isLogin ? "Pas de compte ? Inscrivez-vous." : "Déjà un compte ? Connectez-vous."}
        </button>
      </div>
    </div>
  );
}

