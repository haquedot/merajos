'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Sun,
  Trash2,
} from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { Habit } from '../../types';
import { HabitHeatmap } from '../../components/ui/SVGCharts';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';

import { HabitsSkeleton } from '../../components/ui/Skeleton';

export default function HabitsPage() {
  const { habits, isLoading: isLoadingHabits, toggleHabitForDate, addHabit, deleteHabit, loadFromDB } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load habits from Dexie IndexedDB & MongoDB on page mount
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // New habit form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetDays, setTargetDays] = useState(7);

  if (isLoadingHabits) {
    return <HabitsSkeleton />;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      category,
      icon: 'Activity',
      targetDaysPerWeek: Number(targetDays) || 7,
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header Banner */}
        <PageHeader
          icon={Activity}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400"
          title="Daily Habit Tracker & Heatmap"
          badgeText={`${habits.length} Active`}
          badgeVariant="amber"
          subtitle="Build consistent daily routines, track streaks, and visualize your progress history"
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Habit</span>
            </button>
          }
        />

        {/* Habit List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {habits.map((habit) => {
            const isCompletedToday = !!habit.history[todayStr];
            const totalDaysCompleted = Object.values(habit.history).filter(Boolean).length;

            return (
              <motion.div
                key={habit.id}
                whileHover={{ y: -2 }}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4"
              >
                {/* Header: Title, Category & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate">
                        {habit.name}
                      </h3>
                      <Badge variant="outline" size="sm">
                        {habit.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-orbit-orange flex items-center gap-1 shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {habit.currentStreak} Day Streak
                      </span>
                      <span className="text-gray-400 truncate">
                        Best: {habit.longestStreak} days
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    title="Delete Habit"
                    className="p-2 -mr-1 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Button Row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] font-semibold text-gray-400 hidden xs:inline">
                    {totalDaysCompleted} days completed
                  </span>
                  <button
                    onClick={() => toggleHabitForDate(habit.id, todayStr)}
                    className={`w-full xs:w-auto px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 ${
                      isCompletedToday
                        ? 'bg-orbit-orange text-white shadow-orbit-orange/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orbit-orange hover:text-white dark:hover:bg-orbit-orange dark:hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{isCompletedToday ? 'Completed Today!' : 'Mark Today'}</span>
                  </button>
                </div>

                {/* GitHub style calendar heatmap */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span>Last 60 Days History</span>
                    <span>{totalDaysCompleted} Total</span>
                  </div>
                  <HabitHeatmap history={habit.history} daysCount={60} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Habit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Habit">
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Habit Name *
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 pages of thesis paper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val)}
                options={[
                  { value: 'Spiritual', label: 'Spiritual' },
                  { value: 'Health', label: 'Health' },
                  { value: 'Academic', label: 'Academic' },
                  { value: 'Work', label: 'Work' },
                  { value: 'Career', label: 'Career' },
                  { value: 'Personal', label: 'Personal' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                Save Habit
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
