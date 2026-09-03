/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DeadlineWidget } from "@/components/DeadlineWidget";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const CalendarWidget = dynamic(() => import("@/components/CalendarWidget").then(mod => mod.CalendarWidget), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-[var(--radius-4xl)] bg-[var(--card-bg)] animate-pulse border border-[var(--border)]" />
});

export default function Home() {
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "deadlines"), (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach(doc => loaded.push({ id: doc.id, ...doc.data() }));
      setDeadlines(loaded);
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:h-full min-h-full">
      {/* Calendar Section */}
      <div className="flex-1 xl:max-w-[70%]">
        <CalendarWidget />
      </div>

      {/* Deadlines Section */}
      <div className="flex-1 xl:max-w-[30%] flex flex-col gap-4">
        <h2 className="text-xl font-bold px-2 mb-2">Prochaines Deadlines</h2>
        <div className="flex flex-col gap-4 overflow-y-auto pb-4">
          {deadlines.length === 0 ? (
            <div className="text-sm opacity-60 text-center mt-4">Aucune deadline prévue.</div>
          ) : (
            deadlines
              .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
              .map((d) => (
                <DeadlineWidget key={d.id} id={d.id} title={d.title} targetDate={d.targetDate} />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
