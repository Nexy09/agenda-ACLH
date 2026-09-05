/* eslint-disable */
// @ts-nocheck
import React, { useState } from "react";
import { X, Pencil, Trash2, Mail, MoreVertical, Calendar, AlignLeft, Save } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any; // FullCalendar event object or custom object
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onEditClick?: () => void;
}

export function EventDetailsModal({ isOpen, onClose, event, onDelete, onUpdateNotes, onEditClick }: EventDetailsModalProps) {
  const { user } = useAuth();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState("");

  if (!isOpen || !event) return null;

  // We read custom extended properties from event.extendedProps
  const notes = event.extendedProps?.notes || "";
  const creator = event.extendedProps?.creator || "Inconnu";
  const creatorId = event.extendedProps?.creatorId;

  // Check permissions: Only the creator or an admin can edit/delete the event itself
  const canManageEvent = user?.isAdmin || (creatorId === user?.id) || (!creatorId && user?.isAdmin);

  const handleEditNotes = () => {
    setNotesTemp(notes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(event.id, notesTemp);
    setIsEditingNotes(false);
  };

  // Format date info
  const startDate = event.start ? new Date(event.start) : new Date();
  const endDate = event.end ? new Date(event.end) : null;
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  
  let dateText = startDate.toLocaleDateString('fr-FR', dateOptions);
  if (!event.allDay) {
    const startTimeText = startDate.toLocaleTimeString('fr-FR', timeOptions);
    const endTimeText = endDate ? endDate.toLocaleTimeString('fr-FR', timeOptions) : "";
    dateText += ` ⋅ ${startTimeText}${endTimeText ? ` - ${endTimeText}` : ''}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--card-bg)] rounded-[var(--radius-4xl)] max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Actions */}
        <div className="flex justify-end items-center p-3 gap-2 bg-[var(--background)]/50">
          {canManageEvent && (
            <>
              <button onClick={onEditClick} className="p-2 rounded-full hover:bg-[var(--background)] transition-colors opacity-70 hover:opacity-100">
                <Pencil size={18} />
              </button>
              <button onClick={() => { onDelete(event.id); onClose(); }} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-70">
                <Trash2 size={18} />
              </button>
            </>
          )}
          <button className="p-2 rounded-full hover:bg-[var(--background)] transition-colors opacity-70 hover:opacity-100">
            <Mail size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-[var(--background)] transition-colors opacity-70 hover:opacity-100 mr-2">
            <MoreVertical size={18} />
          </button>
          <button onClick={onClose} className="p-2 bg-[var(--background)] rounded-full hover:bg-[var(--border)] transition-colors ml-2">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 flex flex-col gap-6">
          
          {/* Title & Date */}
          <div className="flex gap-4 items-start">
            <div className="w-4 h-4 rounded mt-2 bg-[var(--primary)] flex-shrink-0" />
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <p className="opacity-80 text-sm mt-1 capitalize">{dateText}</p>
            </div>
          </div>

          {/* Calendar / Creator */}
          <div className="flex gap-4 items-start">
            <Calendar size={20} className="mt-0.5 opacity-60 flex-shrink-0 ml-[-2px]" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Calendrier partagé</span>
              <span className="opacity-60 text-xs">
                Créé par: {creatorId ? (
                  <Link href={`/user/${creatorId}`} className="hover:underline hover:text-[var(--primary)] transition-colors">
                    {creator}
                  </Link>
                ) : (
                  creator
                )}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex gap-4 items-start">
            <AlignLeft size={20} className="mt-1 opacity-60 flex-shrink-0 ml-[-2px]" />
            <div className="flex-1 flex flex-col">
              {isEditingNotes ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    autoFocus
                    value={notesTemp}
                    onChange={(e) => setNotesTemp(e.target.value)}
                    placeholder="Ajouter une description..."
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[1.25rem] p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingNotes(false)} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-[var(--background)]">Annuler</button>
                    <button onClick={handleSaveNotes} className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center gap-2">
                      <Save size={16} /> Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={handleEditNotes}
                  className={clsx(
                    "w-full rounded-[1.25rem] p-3 text-sm cursor-text transition-colors border",
                    notes ? "hover:bg-[var(--background)] border-transparent" : "bg-[var(--background)] border-dashed border-[var(--border)] opacity-70 hover:opacity-100 text-center"
                  )}
                >
                  {notes ? (
                    <span className="whitespace-pre-wrap">{notes}</span>
                  ) : (
                    "Ajouter une description ou des notes..."
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

