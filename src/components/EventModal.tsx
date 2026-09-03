/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import clsx from "clsx";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // Format: YYYY-MM-DD
  editingEvent?: any; // To prefill
  onSave: (event: { title: string; date: string; time?: string; allDay: boolean }) => void;
}

export function EventModal({ isOpen, onClose, initialDate, editingEvent, onSave }: EventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      
      if (editingEvent) {
        setTitle(editingEvent.title);
        setAllDay(editingEvent.allDay);
        
        const d = new Date(editingEvent.start);
        // Add padding zero
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        
        if (!editingEvent.allDay) {
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setTime(`${hh}:${min}`);
        } else {
          setTime("12:00");
        }
      } else {
        setDate(initialDate || new Date().toISOString().split("T")[0]);
        setTitle("");
        setTime("12:00");
        setAllDay(false);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDate, editingEvent]);

  if (!isOpen && !isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, date, time: allDay ? undefined : time, allDay });
    onClose();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex justify-center transition-all duration-300 items-end md:items-center",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content (Bottom Sheet on Mobile, Centered on Desktop) */}
      <div
        className={clsx(
          "relative bg-[var(--card-bg)] w-full md:w-full md:max-w-md shadow-2xl transition-transform duration-300 flex flex-col",
          "rounded-t-[2rem] md:rounded-[2rem] max-h-[90vh]", // One UI highly rounded
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-8 md:scale-95"
        )}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mt-3 mb-1" />

        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">Nouvel Événement</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-[var(--background)] hover:bg-[var(--border)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold opacity-70 ml-2">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion d'équipe"
              className="w-full bg-[var(--background)] px-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold opacity-70 ml-2">Date</label>
            <div className="relative">
              <CalendarIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[var(--background)] pl-12 pr-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium appearance-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4 px-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)] rounded-md"
              />
              <span className="font-semibold">Toute la journée</span>
            </label>
          </div>

          {!allDay && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-semibold opacity-70 ml-2">Heure</label>
              <div className="relative">
                <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[var(--background)] pl-12 pr-5 py-4 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium appearance-none"
                  required={!allDay}
                />
              </div>
            </div>
          )}

          <div className="mt-4 pb-safe">
            <button 
              type="submit"
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg py-4 rounded-full active:scale-[0.98] transition-transform shadow-lg shadow-[var(--primary)]/20"
            >
              {editingEvent ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
