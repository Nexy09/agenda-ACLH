"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

interface DeadlineProps {
  id: string;
  title: string;
  targetDate: string; // ISO string
}

export function DeadlineWidget({ title, targetDate }: DeadlineProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft("Terminé");
        setIsUrgent(false);
        return;
      }

      // If less than 24 hours, mark as urgent
      setIsUrgent(diff < 24 * 60 * 60 * 1000);

      // We can use date-fns for a human readable format
      setTimeLeft(formatDistanceToNowStrict(new Date(targetDate), { locale: fr, addSuffix: false }));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`p-5 rounded-[var(--radius-3xl)] flex items-center justify-between border ${isUrgent ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-[var(--card-bg)] border-[var(--border)]'} shadow-sm transition-colors`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isUrgent ? 'bg-red-500/20' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
          <Clock size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm opacity-70">
            {new Date(targetDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold tracking-tight">
          {timeLeft}
        </div>
        <div className="text-xs font-medium uppercase tracking-wider opacity-60">
          Restant
        </div>
      </div>
    </div>
  );
}

