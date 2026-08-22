'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  ListFilter,
  Clock,
  Sparkles,
  Flame,
  LayoutList,
  CalendarDays,
} from 'lucide-react';
import { useTaskStore, deduplicateTasksList } from '../../store/useTaskStore';
import { Task, TimeSlot, Priority, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { NowFocusCard } from '../../components/dashboard/NowFocusCard';
import { FocusOverlayModal } from '../../components/modals/FocusOverlayModal';
import { PersonalRoutineOverlay } from '../../components/today/PersonalRoutineOverlay';
import { TodayTimelineView } from '../../components/today/TodayTimelineView';
import { getSmartFocusTask, sortTasksChronologically, parseTimeAndSlotFromText } from '../../lib/taskUtils';

import { TaskSkeleton } from '../../components/ui/Skeleton';
import { useHabitStore } from '../../store/useHabitStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useResearchStore } from '../../store/useResearchStore';
import { useCareerStore } from '../../store/useCareerStore';
import { calculateDailyScore } from '../../lib/productivityCalculator';
import { DailyScoreBreakdownModal } from '../../components/modals/DailyScoreBreakdownModal';

export default function TodayPage() {
  const [viewMode, setViewMode] = useState<'timeline' | 'checklist'>('timeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<any>(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [slot, setSlot] = useState<TimeSlot>('morning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');

  const {
    tasks,
    isLoading: isLoadingTasks,
    customFocusTaskId,
    setCustomFocusTaskId,
    toggleTaskStatus,
    toggleMIT,
    addTask,
  } = useTaskStore();
  const { habits } = useHabitStore();
  const { goals } = useGoalStore();
  const { projects } = useProjectStore();
  const { projects: researchProjects } = useResearchStore();
  const { dsaTopics } = useCareerStore();

  if (isLoadingTasks) {
    return <TaskSkeleton />;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const rawTodayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (t.dueDate < todayStr && t.status !== 'completed')
  );
  const { uniqueTasks: deduplicatedTodayTasks } = deduplicateTasksList(rawTodayTasks);
  const todayTasks = sortTasksChronologically(deduplicatedTodayTasks);

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 100;

  // Real Habits Completed calculation
  const habitCompletedToday = habits.filter((h) => !!h.history[todayStr]).length;
  const totalPapers = researchProjects.reduce((acc, p) => {
    return acc + p.sections.reduce((sAcc, s) => sAcc + (s.papers ? s.papers.length : 0), 0);
  }, 0);

  const { dailyScore, breakdownItems } = calculateDailyScore({
    todayTasks,
    habitsCount: habits.length,
    completedHabitsCount: habitCompletedToday,
    habitsList: habits.map((h) => ({ id: h.id, name: h.name, isCompleted: !!h.history[todayStr] })),
    projectsCount: projects.length,
    goalsCount: goals.length,
    completedGoalsCount: goals.filter((g) => g.progress >= 100).length,
    researchCount: totalPapers,
    dsaCount: dsaTopics.length,
  });

  const mits = todayTasks.filter((t) => t.mit);
  const smartFocusTask = getSmartFocusTask(todayTasks);
  const customFocusTask = todayTasks.find((t) => t.id === customFocusTaskId && t.status !== 'completed');
  const effectiveFocusTask = customFocusTask || smartFocusTask;
  const isCustomFocus = !!customFocusTask;

  const slotSections: { key: TimeSlot; title: string; icon: any; color: string }[] = [
    { key: 'morning', title: 'Morning (6:00 AM - 12:00 PM)', icon: Sunrise, color: 'text-amber-500' },
    { key: 'afternoon', title: 'Afternoon (12:00 PM - 5:00 PM)', icon: Sun, color: 'text-blue-500' },
    { key: 'evening', title: 'Evening (5:00 PM - 9:00 PM)', icon: Sunset, color: 'text-purple-500' },
    { key: 'night', title: 'Night (9:00 PM - 12:30 AM)', icon: Moon, color: 'text-indigo-400' },
  ];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      priority,
      status: 'todo',
      category,
      dueDate: todayStr,
      timeSlot: slot,
      estimatedHours: 1,
      actualHours: 0,
      recurring: 'none',
      tags: [category],
      mit: false,
    });

    setTitle('');
    setIsAddModalOpen(false);
  };

  const handleOpenAddModalWithSlot = (defaultSlot?: TimeSlot) => {
    if (defaultSlot) setSlot(defaultSlot);
    setIsAddModalOpen(true);
  };

  return (
    <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as 'timeline' | 'checklist')} className="space-y-4 sm:space-y-6">
      {/* Today Header Banner */}
      <PageHeader
        icon={Sun}
        iconBgColor="bg-amber-50 dark:bg-amber-950/40 text-amber-500"
        title="Today's Focus & Timeline"
        subtitle={`${format(new Date(), 'EEEE, MMMM d, yyyy')} • Plan your day in 4 distinct time slots`}
        actions={
          <>
            {/* Daily Score Breakdown Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScoreModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 shrink-0 cursor-pointer"
              title="Click to view detailed Daily Score breakdown pointers"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Score: {dailyScore}/100</span>
            </Button>

            {/* View Mode Toggle Tabs */}
            <TabsList className="h-9">
              <TabsTrigger value="timeline" className="h-7 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span className='hidden sm:inline'>Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="h-7 text-xs">
                <LayoutList className="w-3.5 h-3.5" />
                <span className='hidden sm:inline'>Checklist</span>
              </TabsTrigger>
            </TabsList>

            <Button
            size={'sm'}
              onClick={() => handleOpenAddModalWithSlot()}
              className="text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </>
        }
      >
        {/* Daily Score Breakdown Modal */}
        <DailyScoreBreakdownModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          dailyScore={dailyScore}
          breakdownItems={breakdownItems}
          dateTitle="Today"
        />
        {/* Progress Bar Header */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
            <span className="text-gray-600 dark:text-gray-400 truncate">
              Today's Completion ({completedCount}/{todayTasks.length} Completed)
            </span>
            <span className="text-orbit-blue font-bold shrink-0">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-orbit-blue rounded-full"
            />
          </div>
        </div>
      </PageHeader>

      {/* NOW / Current Focus Section */}
      <NowFocusCard
        currentTask={effectiveFocusTask}
        allTodayTasks={todayTasks}
        onSelectFocusTask={(t) => setCustomFocusTaskId(t.id || null)}
        isCustomFocus={isCustomFocus}
        onStartFocus={(task) => {
          setActiveFocusTask(task || effectiveFocusTask || todayTasks[0]);
          setIsFocusModalOpen(true);
        }}
      />

      {/* Focus Mode Fullscreen Modal */}
      <FocusOverlayModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        taskTitle={activeFocusTask?.title || 'Today Focus Session'}
        category={activeFocusTask?.category || 'General'}
        onCompleteTask={
          activeFocusTask?.id
            ? () => toggleTaskStatus(activeFocusTask.id)
            : undefined
        }
      />

      {/* RENDER BASED ON VIEW MODE TABS */}
      <TabsContent value="timeline" className="mt-0">
        <TodayTimelineView
          tasks={todayTasks}
          effectiveFocusTaskId={effectiveFocusTask?.id}
          onToggleTaskStatus={toggleTaskStatus}
          onToggleMIT={toggleMIT}
          onSetFocusTask={(id) => setCustomFocusTaskId(id)}
          onOpenAddModal={handleOpenAddModalWithSlot}
        />
      </TabsContent>
      
      <TabsContent value="checklist" className="space-y-4 sm:space-y-6 mt-0">
        {/* Top 3 MIT Section */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orbit-orange shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                Top 3 Most Important Tasks (MITs)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {mits.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ y: -2 }}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                      isDone
                        ? 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800'
                        : 'bg-orbit-blue/5 border-orbit-blue/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-xs font-bold leading-snug break-words min-w-0 flex-1 ${
                          isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <Badge variant={task.category === 'Client' ? 'purple' : 'info'} size="sm">
                        {task.category}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant={effectiveFocusTask?.id === task.id ? 'default' : 'secondary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomFocusTaskId(task.id);
                        }}
                        className="h-6 px-2 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Target className="w-3 h-3" />
                        <span>{effectiveFocusTask?.id === task.id ? 'Focused' : 'Set Focus'}</span>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}

              {mits.length < 3 && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-center text-xs text-gray-400 italic">
                  + Toggle MIT on any task to add to your top 3 daily focus.
                </div>
              )}
            </div>
          </div>

          {/* Personal Routine Timeline Anchors */}
          {/* <PersonalRoutineOverlay /> */}

          {/* 4 Time Slots Sections */}
          <div className="space-y-4 sm:space-y-6">
            {slotSections.map((sec) => {
              const Icon = sec.icon;
              const slotTasks = todayTasks.filter((t) => {
                const parsed = parseTimeAndSlotFromText(`${t.title} ${t.description || ''}`, t.dueDate);
                const effectiveSlot = t.timeSlot && t.timeSlot !== 'afternoon' ? t.timeSlot : parsed.timeSlot;
                return effectiveSlot === sec.key;
              });

              return (
                <div
                  key={sec.key}
                  className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${sec.color} shrink-0`} />
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {sec.title}
                      </h3>
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-400 shrink-0">
                      {slotTasks.filter((t) => t.status === 'completed').length}/{slotTasks.length} Tasks
                    </span>
                  </div>

                  {slotTasks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">No tasks scheduled for this slot.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {slotTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            className="p-3 sm:p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                              <button
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                                  isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0 flex-1">
                                <span
                                  className={`text-xs sm:text-sm font-bold block leading-snug break-words ${
                                    isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {task.title}
                                </span>
                                {task.description && (
                                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/80 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <Badge variant={task.category === 'Client' ? 'purple' : task.category === 'Research' ? 'info' : 'secondary'} size="sm">
                                  {task.category}
                                </Badge>
                                <Badge variant={task.priority === 'urgent' ? 'danger' : 'secondary'} size="sm">
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  size="sm"
                                  variant={effectiveFocusTask?.id === task.id ? 'default' : 'secondary'}
                                  onClick={() => setCustomFocusTaskId(task.id)}
                                  className="h-7 px-2.5 text-[10px] font-bold flex items-center gap-1"
                                  title="Set as Current Focus Task"
                                >
                                  <Target className="w-3 h-3" />
                                  <span>{effectiveFocusTask?.id === task.id ? 'Focused' : 'Set Focus'}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={task.mit ? 'outline' : 'secondary'}
                                  onClick={() => toggleMIT(task.id)}
                                  className={`h-7 px-2.5 text-[10px] font-bold ${
                                    task.mit ? 'border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400' : ''
                                  }`}
                                >
                                  {task.mit ? '★ MIT' : 'Set MIT'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

      {/* Add Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Task for Today">
        <form onSubmit={handleQuickAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practice 3 DSA tree questions"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Time Slot
              </label>
              <Select
                value={slot}
                onValueChange={(val) => setSlot(val as TimeSlot)}
                options={[
                  { value: 'morning', label: 'Morning' },
                  { value: 'afternoon', label: 'Afternoon' },
                  { value: 'evening', label: 'Evening' },
                  { value: 'night', label: 'Night' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as Priority)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Save Today's Task
            </Button>
          </div>
        </form>
      </Modal>
    </Tabs>
  );
}
