"use client";

import React, { useState, useEffect } from "react";
import { DeadlineWidget } from "@/components/DeadlineWidget";
import { Plus, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

interface Deadline {
  id: string;
  title: string;
  targetDate: string;
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "deadlines"), (snapshot) => {
      const loaded: Deadline[] = [];
      snapshot.forEach(doc => loaded.push({ id: doc.id, ...doc.data() } as Deadline));
      setDeadlines(loaded);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime) return;
    
    setIsModalOpen(false);
    
    const newId = Date.now().toString();
    const newDeadline = {
      id: newId,
      title: newTitle,
      targetDate: `${newDate}T${newTime}:00`
    };
    
    await setDoc(doc(db, "deadlines", newId), newDeadline);
    
    setNewTitle("");
    setNewDate("");
    setNewTime("");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "deadlines", id));
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deadlines</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold px-5 py-3 rounded-full active:scale-95 transition-transform shadow-lg shadow-[var(--primary)]/20"
        >
          <Plus size={20} />
          <span>Nouveau</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {deadlines.length === 0 ? (
          <div className="p-8 text-center opacity-60 bg-[var(--card-bg)] rounded-[var(--radius-3xl)] border border-[var(--border)]">
            Aucune deadline prévue.
          </div>
        ) : (
          deadlines
            .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
            .map(d => (
              <div key={d.id} className="relative group">
                <DeadlineWidget id={d.id} title={d.title} targetDate={d.targetDate} />
                <button 
                  onClick={() => handleDelete(d.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-4xl)] p-8 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-xl mb-6">Nouvelle Deadline</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Titre de la deadline"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                required
              />
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                required
              />
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
                required
              />
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold rounded-full hover:bg-[var(--background)]">Annuler</button>
                <button type="submit" className="flex-1 py-4 font-bold rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
