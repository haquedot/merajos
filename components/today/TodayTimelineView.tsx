'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Target,
  Plus,
} from 'lucide-react';
import { Task, TimeSlot, Priority } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { parseTimeAndSlotFromText } from '../../lib/taskUtils';
import { SmartRecommendationCard } from './SmartRecommendationCard';
import { WorkloadWarningCard } from './WorkloadWarningCard';
import { usePersonalizationStore } from '../../store/usePersonalizationStore';
import { buildCurrentContext } from '../../lib/personalization/context/contextBuilder';

interface TodayTimelineViewProps {
  tasks: Task[];
  effectiveFocusTaskId?: string | null;
  onToggleTaskStatus: (id: string) => void;
  onToggleMIT: (id: string) => void;
  onSetFocusTask: (id: string) => void;
  onOpenAddModal: (defaultSlot?: TimeSlot) => void;
}

interface TimelineItem {
  id: string;
  type: 'task' | 'routine';
  timeDisplay: string;
  hour: number;
  minute: number;
  title: string;
  description?: string;
  category: string;
  priority?: Priority;
  timeSlot: TimeSlot;
  status: 'todo' | 'completed';
  isMit?: boolean;
  isFocus?: boolean;
  originalTask?: Task;
}

export const TodayTimelineView: React.FC<TodayTimelineViewProps> = ({
  tasks,
  effectiveFocusTaskId,
  onToggleTaskStatus,
  onToggleMIT,
  onSetFocusTask,
  onOpenAddModal,
}) => {
  const [slotFilter, setSlotFilter] = useState<'all' | TimeSlot>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [nowTimeStr, setNowTimeStr] = useState<string>('');
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setNowTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Build combined timeline items
  const timelineItems: TimelineItem[] = [];

  // Deduplicate tasks prop as safety guard
  const seenKeys = new Set<string>();
  const deduplicatedPropTasks = tasks.filter((t) => {
    const key = `${(t.title || '').trim().toLowerCase()}___${t.dueDate || ''}___${t.time || t.timeSlot || ''}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // Add tasks
  deduplicatedPropTasks.forEach((t) => {
    const parsed = parseTimeAndSlotFromText(`${t.title} ${t.description || ''}`, t.dueDate);
    const effectiveSlot = t.timeSlot && t.timeSlot !== 'afternoon' ? t.timeSlot : parsed.timeSlot;
    const timeStr = t.time || parsed.time;

    let hour = 12;
    let minute = 0;
    if (timeStr) {
      const parts = timeStr.split(':');
      hour = parseInt(parts[0], 10) || 12;
      minute = parseInt(parts[1], 10) || 0;
    } else {
      // Default hour for slot
      if (effectiveSlot === 'morning') hour = 9;
      else if (effectiveSlot === 'afternoon') hour = 14;
      else if (effectiveSlot === 'evening') hour = 18;
      else hour = 21;
    }

    // Format 12h display
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedDisplay = timeStr
      ? `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`
      : `${String(h12).padStart(2, '0')}:00 ${ampm}`;

    timelineItems.push({
      id: t.id,
      type: 'task',
      timeDisplay: formattedDisplay,
      hour,
      minute,
      title: t.title,
      description: t.description,
      category: t.category || 'Personal',
      priority: t.priority,
      timeSlot: effectiveSlot,
      status: t.status === 'completed' ? 'completed' : 'todo',
      isMit: t.mit,
      isFocus: t.id === effectiveFocusTaskId,
      originalTask: t,
    });
  });

  // Sort items by time (hour & minute)
  timelineItems.sort((a, b) => {
    if (a.hour !== b.hour) return a.hour - b.hour;
    return a.minute - b.minute;
  });

  // Apply Filters
  const filteredItems = timelineItems.filter((item) => {
    const matchesSlot = slotFilter === 'all' || item.timeSlot === slotFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && item.status === 'todo') ||
      (statusFilter === 'completed' && item.status === 'completed');
    return matchesSlot && matchesStatus;
  });

  // Group by Time Slots
  const slotHeaders: { key: TimeSlot; title: string; icon: any; color: string; timeRange: string }[] = [
    { key: 'morning', title: 'Morning Slot', timeRange: '06:00 AM - 12:00 PM', icon: Sunrise, color: 'text-amber-500' },
    { key: 'afternoon', title: 'Afternoon Slot', timeRange: '12:00 PM - 05:00 PM', icon: Sun, color: 'text-blue-500' },
    { key: 'evening', title: 'Evening Slot', timeRange: '05:00 PM - 09:00 PM', icon: Sunset, color: 'text-purple-500' },
    { key: 'night', title: 'Night Slot', timeRange: '09:00 PM - 12:30 AM', icon: Moon, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls & Filter Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Time Slot Filter Tabs */}
        <Tabs value={slotFilter} onValueChange={(v) => setSlotFilter(v as any)} className="w-full sm:w-auto max-w-full">
          <TabsList className="h-9 w-max max-w-full shrink-0">
            <TabsTrigger value="all" className="h-7 text-xs shrink-0">
              All Day
            </TabsTrigger>
            {slotHeaders.map((sec) => {
              const Icon = sec.icon;
              return (
                <TabsTrigger key={sec.key} value={sec.key} className="h-7 text-xs shrink-0 whitespace-nowrap">
                  <Icon className={`w-3.5 h-3.5 ${sec.color} shrink-0`} />
                  <span className="capitalize">{sec.key}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-800">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="h-6 text-xs px-2.5">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="h-6 text-xs px-2.5">
                Pending
              </TabsTrigger>
              <TabsTrigger value="completed" className="h-6 text-xs px-2.5">
                Done
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Live Time Ribbon Banner */}
      {nowTimeStr && (
        <div className="px-4 py-2.5 rounded-2xl bg-[#1F3B99]/5 dark:bg-[#6D5BFF]/10 border border-[#1F3B99]/20 dark:border-[#6D5BFF]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6D5BFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1F3B99] dark:bg-[#6D5BFF]"></span>
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-200">Current Local Time:</span>
            <span className="font-extrabold font-mono text-[#1F3B99] dark:text-[#6D5BFF]">{nowTimeStr}</span>
          </div>
          <span className="text-[11px] text-gray-500 hidden sm:inline">Timeline updates in real-time</span>
        </div>
      )}

      {/* Workload Capacity Warning */}
      {(() => {
        const preferences = usePersonalizationStore.getState().preferences;
        const currentContext = buildCurrentContext(tasks, [], preferences, effectiveFocusTaskId || undefined);
        return <WorkloadWarningCard workload={currentContext.workload} />;
      })()}

      {/* Smart Personalization Recommendation Card */}
      <SmartRecommendationCard
        tasks={tasks}
        onToggleMIT={onToggleMIT}
        onSetFocusTask={onSetFocusTask}
      />

      {/* Timeline Stream */}
      <div className="space-y-8 relative">
        {slotHeaders
          .filter((header) => slotFilter === 'all' || slotFilter === header.key)
          .map((header) => {
            const Icon = header.icon;
            const slotItems = filteredItems.filter((item) => item.timeSlot === header.key);

            return (
              <div key={header.key} className="space-y-4">
                {/* Slot Section Header */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <Icon className={`w-4 h-4 ${header.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                        {header.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono">{header.timeRange}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      {slotItems.filter((i) => i.status === 'completed').length}/{slotItems.length} Items
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAddModal(header.key)}
                      className="h-8 text-xs font-bold flex items-center gap-1"
                      title={`Add task to ${header.key}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Task</span>
                    </Button>
                  </div>
                </div>

                {/* Items Stream */}
                {slotItems.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                    <Clock className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500">No tasks scheduled for this time slot.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenAddModal(header.key)}
                      className="text-xs font-bold text-orbit-blue"
                    >
                      + Schedule task in {header.key}
                    </Button>
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-orbit-blue/40 before:via-orbit-blue/40 before:to-gray-200 dark:before:to-gray-800">
                    <AnimatePresence>
                      {slotItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="relative group"
                        >
                          {/* Node Dot Icon on Line */}
                          <div
                            className={`absolute -left-6 sm:-left-7 top-3.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-900 transition-all ${
                              item.status === 'completed'
                                ? 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                : item.isFocus
                                ? 'border-orbit-blue text-orbit-blue ring-4 ring-orbit-blue/20 scale-110'
                                : item.isMit
                                ? 'border-orbit-orange text-orbit-orange'
                                : 'border-orbit-blue/30 text-orbit-blue'
                            }`}
                          >
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : item.isFocus ? (
                              <Target className="w-3 h-3 animate-spin" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-orbit-blue" />
                            )}
                          </div>

                          {/* Card Content */}
                          <div
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              item.status === 'completed'
                                ? 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/80 opacity-75'
                                : item.isFocus
                                ? 'bg-orbit-blue/5 border-orbit-blue/30 shadow-xs'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xs hover:border-orbit-blue/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              {/* Left Content */}
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <button
                                  onClick={() => onToggleTaskStatus(item.id)}
                                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-500 text-white'
                                      : 'border border-gray-300 dark:border-gray-600 hover:border-orbit-blue'
                                  }`}
                                >
                                  {item.status === 'completed' && '✓'}
                                </button>

                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-orbit-blue">
                                      {item.timeDisplay}
                                    </span>
                                    <span
                                      className={`text-xs sm:text-sm font-bold ${
                                        item.status === 'completed'
                                          ? 'line-through text-gray-400 dark:text-gray-500'
                                          : 'text-gray-900 dark:text-white'
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                  </div>

                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Actions & Badges */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant={
                                      item.category === 'Client'
                                        ? 'purple'
                                        : item.category === 'Research'
                                        ? 'info'
                                        : 'secondary'
                                    }
                                    size="sm"
                                  >
                                    {item.category}
                                  </Badge>
                                  {item.priority && (
                                    <Badge
                                      variant={item.priority === 'urgent' ? 'danger' : 'secondary'}
                                      size="sm"
                                    >
                                      {item.priority}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant={item.isFocus ? 'default' : 'secondary'}
                                    onClick={() => onSetFocusTask(item.id)}
                                    className="h-7 px-2.5 text-[10px] font-bold flex items-center gap-1"
                                    title="Set focus task"
                                  >
                                    <Target className="w-3 h-3" />
                                    <span>{item.isFocus ? 'Focused' : 'Set Focus'}</span>
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant={item.isMit ? 'outline' : 'secondary'}
                                    onClick={() => onToggleMIT(item.id)}
                                    className={`h-7 px-2 text-[10px] font-bold ${
                                      item.isMit ? 'border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400' : ''
                                    }`}
                                  >
                                    {item.isMit ? '★ MIT' : 'Set MIT'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
