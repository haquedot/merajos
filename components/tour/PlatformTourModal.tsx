'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Sliders,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Search,
  Calendar,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  shortcutTip?: string;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Orbit 👋',
    subtitle: 'Your Personal Productivity Command Center',
    description:
      'Orbit helps you organize your daily work, track habits, set goals, manage client projects, and execute your career roadmap with high focus.',
    icon: <Logo variant="icon" size={48} />,
    highlights: [
      'Personalized module system tuned to your role',
      'Local-first performance with offline support',
      'Optional Google Tasks & Calendar synchronization',
    ],
    color: 'from-blue-600 to-indigo-600',
  },
  {
    title: 'Dashboard & Daily Score 📊',
    subtitle: 'Track Focus & Progress at a Glance',
    description:
      'Your Dashboard aggregates live metrics across your active projects, habits, research, and DSA practice into a single Daily Focus Score.',
    icon: <LayoutDashboard className="w-10 h-10 text-blue-500" />,
    highlights: [
      'Designate your Top 3 Most Important Tasks (MITs) daily',
      'Automated daily performance snapshots generated at 11:45 PM',
      'Visual progress rings and historical productivity analytics',
    ],
    color: 'from-[#1F3B99] to-blue-600',
  },
  {
    title: 'Tasks, Today & Calendar 📅',
    subtitle: 'Plan, Schedule & Time-Block',
    description:
      'Stay organized with structured task management, priority flags, estimated vs actual time tracking, and interactive calendar time-blocking.',
    icon: <CheckSquare className="w-10 h-10 text-emerald-500" />,
    highlights: [
      'Filter view for Today, Upcoming, and Completed tasks',
      'Drag-and-drop calendar scheduling',
      'Direct synchronization with Google Calendar & Google Tasks',
    ],
    shortcutTip: 'Click any task checkbox to complete it instantly',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    title: 'Specialized Workspaces 🚀',
    subtitle: 'Tools Tailored to Your Role',
    description:
      'Access dedicated modules for Client Projects, Research Papers & Thesis writing, Career & DSA practice, Habits tracking, Goals, and Brain Dump Notes.',
    icon: <Sliders className="w-10 h-10 text-purple-500" />,
    highlights: [
      'Client Projects: Kanban boards & feature tracking',
      'Research: Paper citation tracker & writing progress',
      'Career & DSA: Job application pipeline & interview checklists',
      'Habits & Goals: Streaks and milestone tracking',
    ],
    shortcutTip: 'Toggle any module on or off in Settings anytime',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    title: 'Quick Search & Shortcut Commands ⚡',
    subtitle: 'Move Fast with Instant Actions',
    description:
      'Use global search to find any task, event, note, or project instantly, or use Quick Add to create items from anywhere in the app.',
    icon: <Zap className="w-10 h-10 text-amber-500" />,
    highlights: [
      'Press Ctrl + K (or Cmd + K) anytime to open Global Search',
      'Click the + button in the Navbar for Quick Add modal',
      'Use the right productivity drawer for Pomodoro timer & notes',
    ],
    shortcutTip: 'Shortcut: Press Ctrl + K anytime',
    color: 'from-amber-500 to-orange-600',
  },
];

interface PlatformTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformTourModal: React.FC<PlatformTourModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white dark:bg-[#101827] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative"
      >
        {/* Top Header Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
              Platform Tour · Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Step Body */}
        <div className="p-6 min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 shadow-xs flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>

              {/* Highlights Checklist */}
              <div className="space-y-2 pt-1">
                {step.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Actionable Shortcut Tip */}
              {step.shortcutTip && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Tip: {step.shortcutTip}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls Footer */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-6 bg-blue-600 dark:bg-blue-400'
                      : 'w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <span>{isLast ? 'Get Started' : 'Next Step'}</span>
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
