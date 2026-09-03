/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { Plus } from "lucide-react";
import { EventModal } from "./EventModal";
import { EventDetailsModal } from "./EventDetailsModal";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

export function CalendarWidget() {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach(doc => loaded.push({ id: doc.id, ...doc.data() }));
      setEvents(loaded);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleFabClick = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: { title: string; date: string; time?: string; allDay: boolean }) => {
    const newStart = eventData.allDay ? eventData.date : `${eventData.date}T${eventData.time}:00`;
    
    if (eventToEdit) {
      await setDoc(doc(db, "events", eventToEdit.id), {
        title: eventData.title,
        start: newStart,
        allDay: eventData.allDay,
      }, { merge: true });
    } else {
      const newId = Date.now().toString();
      await setDoc(doc(db, "events", newId), {
        id: newId,
        title: eventData.title,
        start: newStart,
        allDay: eventData.allDay,
        extendedProps: {
          creator: `${user?.firstName} ${user?.lastName}`,
          creatorId: user?.id,
          notes: ""
        }
      });
    }
    
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (arg: any) => {
    const eventObj = events.find(e => e.id === arg.event.id);
    if (eventObj) {
      setSelectedEvent(eventObj);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const ev = events.find(e => e.id === id);
    if (ev) {
      await updateDoc(doc(db, "events", id), {
        extendedProps: { ...ev.extendedProps, notes }
      });
      setSelectedEvent({ ...ev, extendedProps: { ...ev.extendedProps, notes } });
    }
  };

  const handleEditClick = () => {
    setEventToEdit(selectedEvent);
    setIsModalOpen(true);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="bg-[var(--card-bg)] rounded-[var(--radius-4xl)] p-4 sm:p-6 shadow-sm border border-[var(--border)] h-[calc(100vh-140px)] sm:h-[calc(100vh-80px)] relative overflow-hidden flex flex-col">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
          locale={frLocale}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: isMobile ? "" : "dayGridMonth,timeGridWeek",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          contentHeight="auto"
          dayMaxEvents={true}
          nowIndicator={true}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDayText="Jour"
        />
        
        {/* Floating Action Button for mobile */}
        <button 
          onClick={handleFabClick}
          className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
        >
          <Plus size={28} />
        </button>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEventToEdit(null); }}
        initialDate={selectedDate}
        editingEvent={eventToEdit}
        onSave={handleSaveEvent}
      />
      
      <EventDetailsModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onUpdateNotes={handleUpdateNotes}
        onEditClick={handleEditClick}
      />
    </>
  );
}
