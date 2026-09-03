/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import { Users, ChevronDown, X, Phone } from "lucide-react";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const START_HOUR = 8;
const START_MIN = 30;
const END_HOUR = 17;

const SLOTS = Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
  const h = START_HOUR + i;
  return `${h.toString().padStart(2, "0")}h${START_MIN} - ${(h + 1).toString().padStart(2, "0")}h${START_MIN}`;
});

interface UserAvailability {
  userId: string;
  name: string;
  avatar: string;
  availableSlots: string[];
  phoneNumber?: string;
}

export function TimetableWidget() {
  const { user, getAllUsers } = useAuth();
  const [myAvailableSlots, setMyAvailableSlots] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"my_matches" | "all_groups">("my_matches");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [colleagues, setColleagues] = useState<UserAvailability[]>([]);
  const [selectedContact, setSelectedContact] = useState<UserAvailability | null>(null);

  // Listen to timetables from Firestore
  useEffect(() => {
    if (!user) return;
    
    const unsub = onSnapshot(collection(db, "timetables"), (snapshot) => {
      const allSlots: Record<string, string[]> = {};
      snapshot.forEach(doc => {
        allSlots[doc.id] = doc.data().slots || [];
      });
      
      // Update my slots
      setMyAvailableSlots(prev => {
        const newArray = allSlots[user.id] || [];
        const prevArray = Array.from(prev);
        if (JSON.stringify(prevArray) === JSON.stringify(newArray)) return prev;
        return new Set(newArray);
      });

      // Update colleagues
      const users = getAllUsers();
      const loadedColleagues = users
        .filter(u => u.id !== user.id)
        .map(u => ({
          userId: u.id,
          name: `${u.firstName} ${u.lastName}`,
          avatar: `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase(),
          availableSlots: allSlots[u.id] || [],
          phoneNumber: u.phoneNumber
        }));
      
      setColleagues(loadedColleagues);
    });

    return () => unsub();
  }, [user, getAllUsers]);

  const toggleSlot = async (day: string, slot: string) => {
    if (!user) return;
    
    const key = `${day}-${slot}`;
    const newSet = new Set(myAvailableSlots);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    
    // Optimistic UI update
    setMyAvailableSlots(newSet);
    
    // Save to Firestore
    await setDoc(doc(db, "timetables", user.id), {
      slots: Array.from(newSet)
    });
  };

  const matchGroups = useMemo(() => {
    const groups: { slotKey: string; day: string; time: string; users: UserAvailability[] }[] = [];
    myAvailableSlots.forEach((slotKey) => {
      const [day, time] = slotKey.split("-");
      const matchedUsers = colleagues.filter((c) => c.availableSlots.includes(slotKey));
      if (matchedUsers.length > 0) {
        groups.push({ slotKey, day, time, users: matchedUsers });
      }
    });
    return groups.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || SLOTS.indexOf(a.time) - SLOTS.indexOf(b.time));
  }, [myAvailableSlots, colleagues]);

  const allGroups = useMemo(() => {
    const groups: { slotKey: string; day: string; time: string; users: UserAvailability[] }[] = [];
    const meAsUser: UserAvailability = { 
      userId: user?.id || "me", 
      name: "Moi", 
      avatar: "M", 
      availableSlots: Array.from(myAvailableSlots),
      phoneNumber: user?.phoneNumber
    };
    const allUsers = [meAsUser, ...colleagues];

    DAYS.forEach(day => {
      SLOTS.forEach(time => {
        const slotKey = `${day}-${time}`;
        const usersInSlot = allUsers.filter(u => u.availableSlots.includes(slotKey));
        if (usersInSlot.length >= 2) {
          groups.push({ slotKey, day, time, users: usersInSlot });
        }
      });
    });

    return groups;
  }, [myAvailableSlots, colleagues, user]);

  const displayedGroups = viewMode === "my_matches" ? matchGroups : allGroups;

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full pb-8">
      {/* Timetable Grid */}
      <div className="flex-1 bg-[var(--card-bg)] rounded-[var(--radius-4xl)] shadow-sm border border-[var(--border)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-2xl font-bold">Mes Disponibilités</h2>
          <p className="text-sm opacity-70 mt-1">Sélectionnez vos créneaux de pause (par tranches d'une heure).</p>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="font-semibold text-center text-sm opacity-50">Heure</div>
              {DAYS.map((day) => (
                <div key={day} className="font-bold text-center bg-[var(--background)] py-2 rounded-full">{day}</div>
              ))}
            </div>
            
            {/* Grid */}
            {SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-6 gap-2 mb-2">
                <div className="flex items-center justify-center text-xs font-semibold opacity-70 bg-[var(--background)] rounded-2xl py-2">
                  {slot.replace(" - ", "\n")}
                </div>
                {DAYS.map((day) => {
                  const key = `${day}-${slot}`;
                  const isAvailable = myAvailableSlots.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSlot(day, slot)}
                      className={clsx(
                        "h-16 rounded-[1.25rem] border-2 transition-all active:scale-95",
                        isAvailable 
                          ? "bg-[var(--primary)] border-[var(--primary)] shadow-md shadow-[var(--primary)]/20 text-[var(--primary-foreground)]" 
                          : "bg-transparent border-dashed border-[var(--border)] hover:bg-[var(--background)] hover:border-solid text-transparent"
                      )}
                    >
                      {isAvailable && <span className="font-semibold">Libre</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-computed Groups */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        
        {/* Dropdown Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full bg-[var(--card-bg)] border border-[var(--border)] px-5 py-3 rounded-full shadow-sm active:scale-95 transition-transform"
          >
            <span className="font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-[var(--primary)]" />
              {viewMode === "my_matches" ? "Heures en commun" : "Tous les groupes"}
            </span>
            <ChevronDown size={20} className={clsx("transition-transform", isDropdownOpen && "rotate-180")} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden z-20">
              <button 
                className="w-full text-left px-5 py-3 font-semibold hover:bg-[var(--background)] transition-colors"
                onClick={() => { setViewMode("my_matches"); setIsDropdownOpen(false); }}
              >
                Heures en commun
              </button>
              <button 
                className="w-full text-left px-5 py-3 font-semibold hover:bg-[var(--background)] transition-colors"
                onClick={() => { setViewMode("all_groups"); setIsDropdownOpen(false); }}
              >
                Tous les groupes
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4 overflow-y-auto">
          {displayedGroups.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-[var(--radius-3xl)] text-center opacity-60">
              {viewMode === "my_matches" ? "Aucune heure en commun avec vos collègues." : "Aucun groupe disponible."}
            </div>
          ) : (
            displayedGroups.map((group) => (
              <div key={group.slotKey} className="bg-[var(--card-bg)] border border-[var(--border)] p-5 rounded-[var(--radius-3xl)] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{group.day}</h3>
                    <p className="text-sm opacity-80 text-[var(--primary)] font-medium">{group.time}</p>
                  </div>
                  <div className="bg-[var(--primary)]/10 text-[var(--primary)] font-bold px-3 py-1 rounded-full text-sm">
                    {group.users.length} match(s)
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.users.map(u => (
                    <button 
                      key={u.userId} 
                      onClick={() => u.userId !== (user?.id || "me") && setSelectedContact(u)}
                      className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full border transition-transform active:scale-95", u.userId === (user?.id || "me") ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)] cursor-default" : "bg-[var(--background)] border-[var(--border)] hover:bg-[var(--border)]")}
                    >
                      <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", u.userId === (user?.id || "me") ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--foreground)] text-[var(--background)]")}>
                        {u.avatar}
                      </div>
                      <span className="text-sm font-semibold">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-4xl)] p-8 max-w-sm w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Contact</h3>
              <button onClick={() => setSelectedContact(null)} className="p-2 bg-[var(--background)] rounded-full hover:bg-[var(--border)]">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-3xl font-bold shadow-lg shadow-[var(--primary)]/20">
                {selectedContact.avatar}
              </div>
              <div>
                <h4 className="text-2xl font-bold">{selectedContact.name}</h4>
              </div>
              {selectedContact.phoneNumber ? (
                <div className="flex items-center gap-3 bg-[var(--background)] px-5 py-3 rounded-full mt-2 w-full justify-center">
                  <Phone size={18} className="text-[var(--primary)]" />
                  <span className="font-mono font-semibold text-lg">{selectedContact.phoneNumber}</span>
                </div>
              ) : (
                <p className="opacity-60 text-sm">Numéro non renseigné</p>
              )}
              <a 
                href={`tel:${selectedContact.phoneNumber}`}
                className={clsx("w-full py-4 rounded-full font-bold text-lg mt-4", selectedContact.phoneNumber ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--border)] opacity-50 cursor-not-allowed")}
              >
                Appeler
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
