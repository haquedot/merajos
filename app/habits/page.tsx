'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { Habit } from '../../types';
import { HabitHeatmap } from '../../components/ui/SVGCharts';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function HabitsPage() {
  const { habits, toggleHabitForDate, addHabit, deleteHabit } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New habit form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetDays, setTargetDays] = useState(7);

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Daily Habit Tracker & Heatmap
              </h1>
              <p className="text-xs text-gray-500">
                Build consistent daily routines, track streaks, and visualize your progress history
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Habit
          </button>
        </div>
      </div>

      {/* Habit List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => {
          const isCompletedToday = !!habit.history[todayStr];
          const totalDaysCompleted = Object.values(habit.history).filter(Boolean).length;

          return (
            <motion.div
              key={habit.id}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {habit.name}
                    </h3>
                    <Badge variant="outline" size="sm">
                      {habit.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      {habit.currentStreak} Day Streak
                    </span>
                    <span className="text-gray-400">
                      Best: {habit.longestStreak} days
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleHabitForDate(habit.id, todayStr)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 ${
                    isCompletedToday
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompletedToday ? 'Completed!' : 'Mark Today'}
                </button>
              </div>

              {/* GitHub style calendar heatmap */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Last 60 Days History
                </span>
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
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 20 pages of thesis paper"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            >
              <option value="Spiritual">Spiritual</option>
              <option value="Health">Health</option>
              <option value="Academic">Academic</option>
              <option value="Work">Work</option>
              <option value="Career">Career</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Save Habit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
