'use client';

import React from 'react';
import { Play, Clock, Sparkles, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/select';

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
  // Deduplicate tasks by ID and title/time to avoid duplicate options in dropdown
  const uncompletedTasks = allTodayTasks.filter((t) => t.status !== 'completed');
  const uniqueUncompletedTasks = uncompletedTasks.filter(
    (t, index, self) =>
      index ===
      self.findIndex(
        (o) =>
          (o.id && t.id && o.id === t.id) ||
          (o.title.trim().toLowerCase() === t.title.trim().toLowerCase() && (o.time || '') === (t.time || ''))
      )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-xs relative overflow-visible group z-20"
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-xl w-full">
          {/* NOW Badge & Task Switcher Dropdown */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orbit-blue/10 border border-orbit-blue/20 text-orbit-blue text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-orbit-orange animate-pulse shrink-0" />
                NOW FOCUS
              </div>

              {isCustomFocus && (
                <Badge variant="warning" size="sm">
                  🎯 Custom Selection
                </Badge>
              )}
            </div>

            {/* Quick Task Selection Dropdown */}
            {uniqueUncompletedTasks.length > 0 && onSelectFocusTask && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">Set Focus:</span>
                <Select
                  value={currentTask?.id || ''}
                  onValueChange={(val) => {
                    const found = uniqueUncompletedTasks.find((t) => t.id === val);
                    if (found) onSelectFocusTask(found);
                  }}
                  options={uniqueUncompletedTasks.map((t) => ({
                    value: t.id || '',
                    label: `${t.time ? `[${t.time}] ` : ''}${t.title}`,
                  }))}
                  placeholder="Select Custom Focus Task..."
                  className="w-[180px] sm:w-[240px] text-xs h-8"
                />
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
                  <Badge variant="secondary" size="sm">
                    {currentTask.category}
                  </Badge>
                )}
                {currentTask.time ? (
                  <span className="flex items-center gap-1 font-extrabold text-orbit-blue">
                    <Clock className="w-3.5 h-3.5 text-orbit-blue" />
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
                  <span className="text-orbit-orange font-extrabold flex items-center gap-1">
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
        <Button
          onClick={() => onStartFocus(currentTask)}
          className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white shrink-0" />
          <span>Start Focus Mode</span>
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};
