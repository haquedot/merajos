'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, Sparkles, BookOpen, Sun, Moon } from 'lucide-react';

export interface RoutineItem {
  id: string;
  title: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  suggestedTime: string;
  category: string;
}

const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: 'fajr', title: 'Fajr & Quran Study', timeSlot: 'morning', suggestedTime: '05:30 - 06:30', category: 'Personal' },
  { id: 'breakfast', title: 'Breakfast & Morning Review', timeSlot: 'morning', suggestedTime: '08:00 - 08:30', category: 'Personal' },
  { id: 'deepwork', title: 'Deep Work Core Focus Block', timeSlot: 'morning', suggestedTime: '09:00 - 12:30', category: 'Career' },
  { id: 'dhuhr', title: 'Dhuhr & Lunch Break', timeSlot: 'afternoon', suggestedTime: '01:15 - 02:00', category: 'Personal' },
  { id: 'research', title: 'Research & Project Shipping', timeSlot: 'afternoon', suggestedTime: '02:30 - 05:00', category: 'Research' },
  { id: 'asr', title: 'Asr & Evening Walk', timeSlot: 'evening', suggestedTime: '05:15 - 06:00', category: 'Personal' },
  { id: 'maghrib', title: 'Maghrib & Family Dinner', timeSlot: 'evening', suggestedTime: '06:40 - 07:30', category: 'Personal' },
  { id: 'isha', title: 'Isha & Night Learning Block', timeSlot: 'night', suggestedTime: '08:30 - 10:30', category: 'Career' },
  { id: 'sleep', title: 'Wind Down & Sleep', timeSlot: 'night', suggestedTime: '11:00 PM', category: 'Personal' },
];

export const PersonalRoutineOverlay: React.FC = () => {
  const [completedRoutines, setCompletedRoutines] = useState<string[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`orbit_routines_${todayStr}`);
      if (stored) {
        try {
          setCompletedRoutines(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [todayStr]);

  const toggleRoutine = (id: string) => {
    const updated = completedRoutines.includes(id)
      ? completedRoutines.filter((r) => r !== id)
      : [...completedRoutines, id];
    setCompletedRoutines(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`orbit_routines_${todayStr}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#1F3B99]/5 dark:bg-[#6D5BFF]/10 border border-[#1F3B99]/20 dark:border-[#6D5BFF]/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1F3B99] dark:text-[#6D5BFF]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Daily Personal Routine Anchors
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#1F3B99] dark:text-[#6D5BFF]">
          {completedRoutines.length}/{DEFAULT_ROUTINES.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {DEFAULT_ROUTINES.map((item) => {
          const isDone = completedRoutines.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleRoutine(item.id)}
              className={`p-2.5 rounded-xl text-left border flex items-center justify-between gap-2 transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-500 dark:text-gray-400 line-through'
                  : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[#1F3B99]/50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block truncate">{item.title}</span>
                <span className="text-[10px] text-gray-400 font-mono">{item.suggestedTime}</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
