'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ModuleKey } from '../../../types';

interface Step5Props {
  displayName: string;
  enabledModules: ModuleKey[];
  isSaving: boolean;
  onFinish: () => void;
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  tasks: 'Tasks',
  calendar: 'Calendar',
  habits: 'Habits',
  goals: 'Goals',
  notes: 'Notes',
  links: 'Saved Links',
  weekly_planner: 'Weekly Planner',
  analytics: 'Analytics',
  clients: 'Client Projects',
  research: 'Research',
  career: 'Career & DSA',
};

export const Step5Done: React.FC<Step5Props> = ({ displayName, enabledModules, isSaving, onFinish }) => {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-7 py-4"
    >
      {/* Animated check icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>

      {/* Heading */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          You're all set, {displayName}!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Your personal Orbit workspace is ready. Here's what we've enabled for you:
        </p>
      </div>

      {/* Active Modules */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {enabledModules.map((mod) => (
          <motion.span
            key={mod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            {MODULE_LABELS[mod]}
          </motion.span>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        You can add or remove sections anytime in Settings.
      </p>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onFinish}
        disabled={isSaving}
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl btn-primary text-white text-sm font-bold shadow-xl shadow-blue-500/25 transition-all duration-200 disabled:opacity-60"
      >
        {isSaving ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving…
          </>
        ) : (
          <>
            Open My Workspace
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
