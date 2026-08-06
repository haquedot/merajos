'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Target,
  CheckCircle2,
  Circle,
  Brain,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useWeeklyStore } from '../../store/useWeeklyStore';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightProductivityPanel: React.FC<RightPanelProps> = ({ isOpen, onClose }) => {
  // Pomodoro state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Quick brain dump note
  const { plan, updatePlan } = useWeeklyStore();
  const [quickNote, setQuickNote] = useState(plan.brainDump || '');

  const { tasks, toggleTaskStatus } = useTaskStore();
  const { habits, toggleHabitForDate } = useHabitStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const mits = tasks.filter((t) => t.mit);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'focus') {
        alert('🎉 Focus Session Completed! Time for a 5-minute break.');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('⚡ Break Time Ended! Ready to get back into focus mode?');
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setQuickNote(val);
    updatePlan({ brainDump: val });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed top-16 right-0 bottom-0 z-30 w-80 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-xl overflow-y-auto flex flex-col p-4 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">
                Productivity Hub
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pomodoro Focus Timer */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {mode === 'focus' ? 'Deep Focus Session' : 'Short Break'}
              </span>
            </div>

            <div className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-widest my-2">
              {formatTimer(timeLeft)}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={toggleTimer}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 text-white shadow-xs transition-transform active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-xl bg-gray-200/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Top MITs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Today's Top 3 MITs
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">
                {mits.filter((m) => m.status === 'completed').length}/{mits.length}
              </span>
            </div>

            {mits.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No MITs set yet for today.</p>
            ) : (
              <div className="space-y-2">
                {mits.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="group p-2.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer flex items-start gap-2.5 transition-all"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-0.5 shrink-0 transition-colors" />
                      )}
                      <span
                        className={`text-xs font-medium leading-tight ${
                          isDone
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Habits checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Daily Habits Check
                </h4>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {habits.slice(0, 5).map((habit) => {
                const isChecked = !!habit.history[todayStr];
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitForDate(habit.id, todayStr)}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {habit.name}
                    </span>
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-700'
                    }`}>
                      {isChecked && '✓'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Scratchpad / Brain Dump */}
          <div className="space-y-2 flex-1 flex flex-col min-h-[140px]">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Quick Brain Dump
              </h4>
            </div>

            <textarea
              value={quickNote}
              onChange={handleNoteChange}
              placeholder="Jot down quick thoughts, ideas, or reminders..."
              className="w-full flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
