'use client';

import React from 'react';
import { Play, Clock, Sparkles, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskItem {
  id?: string;
  title: string;
  category?: string;
  estimatedHours?: number;
  priority?: string;
  mit?: boolean;
  time?: string;
  timeSlot?: string;
}

interface TaskItem {
  id?: string;
  title: string;
  category?: string;
  estimatedHours?: number;
  priority?: string;
  mit?: boolean;
  time?: string;
  timeSlot?: string;
  status?: string;
}

interface NowFocusCardProps {
  currentTask?: TaskItem | null;
  allTodayTasks?: TaskItem[];
  onSelectFocusTask?: (task: TaskItem) => void;
  onStartFocus: (task?: TaskItem | null) => void;
  isCustomFocus?: boolean;
}

export const NowFocusCard: React.FC<NowFocusCardProps> = ({
  currentTask,
  allTodayTasks = [],
  onSelectFocusTask,
  onStartFocus,
  isCustomFocus = false,
}) => {
  const uncompletedTasks = allTodayTasks.filter((t) => t.status !== 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-xs relative overflow-hidden group"
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-xl w-full">
          {/* NOW Badge & Task Switcher Dropdown */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[#1F3B99] dark:text-[#6D5BFF] text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                NOW FOCUS
              </div>

              {isCustomFocus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  🎯 Custom Selection
                </span>
              )}
            </div>

            {/* Quick Task Selection Dropdown */}
            {uncompletedTasks.length > 0 && onSelectFocusTask && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">Set Focus:</span>
                <select
                  value={currentTask?.id || ''}
                  onChange={(e) => {
                    const found = uncompletedTasks.find((t) => t.id === e.target.value);
                    if (found) onSelectFocusTask(found);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 max-w-[200px] sm:max-w-[240px] truncate"
                >
                  <option value="" disabled>Select Custom Focus Task...</option>
                  {uncompletedTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.time ? `[${t.time}] ` : ''}{t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-gray-900 dark:text-white line-clamp-1">
            {currentTask ? currentTask.title : 'Ready to start deep work session?'}
          </h2>

          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex items-center gap-3 flex-wrap">
            {currentTask ? (
              <>
                {currentTask.category && (
                  <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs border border-gray-200/60 dark:border-gray-700">
                    {currentTask.category}
                  </span>
                )}
                {currentTask.time ? (
                  <span className="flex items-center gap-1 font-extrabold text-blue-600 dark:text-blue-400">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Scheduled: {currentTask.time}
                  </span>
                ) : currentTask.timeSlot ? (
                  <span className="flex items-center gap-1 font-bold text-gray-600 dark:text-gray-400 capitalize">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {currentTask.timeSlot} Slot
                  </span>
                ) : null}
                {currentTask.estimatedHours ? (
                  <span className="flex items-center gap-1 font-bold text-gray-600 dark:text-gray-400">
                    Est: {currentTask.estimatedHours}h
                  </span>
                ) : null}
                {currentTask.mit && (
                  <span className="text-amber-500 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Top Priority MIT
                  </span>
                )}
              </>
            ) : (
              <span>Pick a task or enter Focus Mode to eliminate distractions and get into flow state.</span>
            )}
          </div>
        </div>

        {/* Start Focus Button */}
        <button
          onClick={() => onStartFocus(currentTask)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white shrink-0" />
          <span>Start Focus Mode</span>
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
};
