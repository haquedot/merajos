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
import { useTaskStore } from '../../store/useTaskStore';
import { Task, TimeSlot, Priority, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function TodayPage() {
  const [viewMode, setViewMode] = useState<'timeline' | 'checklist'>('checklist');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [slot, setSlot] = useState<TimeSlot>('morning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');

  const { tasks, toggleTaskStatus, toggleMIT, addTask } = useTaskStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 100;

  const mits = todayTasks.filter((t) => t.mit);

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

  return (
    <div className="space-y-6">
      {/* Today Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Today's Focus & Timeline
              </h1>
            </div>
            <p className="text-xs text-gray-500">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • Plan your day in 4 distinct time slots
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('checklist')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'checklist'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Checklist View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Timeline View
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-600 dark:text-gray-400">
              Today's Completion ({completedCount}/{todayTasks.length} Completed)
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Top 3 MIT Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Top 3 Most Important Tasks (MITs)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mits.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -2 }}
                onClick={() => toggleTaskStatus(task.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800'
                    : 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs font-bold leading-snug ${
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
                  <span className="text-[10px] text-gray-400 font-medium">
                    {task.estimatedHours}h est
                  </span>
                </div>
              </motion.div>
            );
          })}

          {mits.length < 3 && (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-center text-xs text-gray-400 italic">
              + Toggle MIT on any task to add to your top 3 daily focus.
            </div>
          )}
        </div>
      </div>

      {/* 4 Time Slots Sections */}
      <div className="space-y-6">
        {slotSections.map((sec) => {
          const Icon = sec.icon;
          const slotTasks = todayTasks.filter((t) => t.timeSlot === sec.key || (!t.timeSlot && sec.key === 'morning'));

          return (
            <div
              key={sec.key}
              className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${sec.color}`} />
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {sec.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-gray-400">
                  {slotTasks.filter((t) => t.status === 'completed').length}/{slotTasks.length} Tasks
                </span>
              </div>

              {slotTasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No tasks scheduled for this slot.</p>
              ) : (
                <div className="space-y-2">
                  {slotTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 flex items-center justify-between hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span
                              className={`text-xs font-bold ${
                                isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMIT(task.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                              task.mit
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {task.mit ? '★ MIT' : 'Set MIT'}
                          </button>
                          <Badge variant={task.priority === 'urgent' ? 'danger' : 'secondary'} size="sm">
                            {task.priority}
                          </Badge>
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

      {/* Add Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Task for Today">
        <form onSubmit={handleQuickAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practice 3 DSA tree questions"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Time Slot
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as TimeSlot)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              Save Today's Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
