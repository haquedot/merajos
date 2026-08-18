'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare, CalendarDays, Activity, Target, FileText,
  BarChart3, Briefcase, BookOpen, GraduationCap, Link2, Check,
} from 'lucide-react';
import { ModuleKey } from '../../../types';

interface ModuleOption {
  key: ModuleKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  alwaysOn?: boolean;
  color: string;
}

const MODULE_OPTIONS: ModuleOption[] = [
  { key: 'tasks',          label: 'Tasks',           description: 'Daily task management & priorities',  icon: <CheckSquare className="w-5 h-5" />,  alwaysOn: true, color: 'blue' },
  { key: 'calendar',       label: 'Calendar',        description: 'Events, meetings & scheduling',        icon: <CalendarDays className="w-5 h-5" />, alwaysOn: true, color: 'blue' },
  { key: 'habits',         label: 'Habits',          description: 'Daily habits & streak tracking',       icon: <Activity className="w-5 h-5" />,     color: 'amber' },
  { key: 'goals',          label: 'Goals',           description: 'Long & short term goal setting',       icon: <Target className="w-5 h-5" />,        color: 'green' },
  { key: 'notes',          label: 'Notes',           description: 'Notes, ideas & brain dump',            icon: <FileText className="w-5 h-5" />,      color: 'yellow' },
  { key: 'links',          label: 'Saved Links',     description: 'Bookmark vault & link manager',        icon: <Link2 className="w-5 h-5" />,         color: 'blue' },
  { key: 'weekly_planner', label: 'Weekly Planner',  description: 'Week planning & reviews',              icon: <CalendarDays className="w-5 h-5" />,  color: 'purple' },
  { key: 'analytics',      label: 'Analytics',       description: 'Productivity charts & insights',       icon: <BarChart3 className="w-5 h-5" />,     color: 'sky' },
  { key: 'clients',        label: 'Client Projects', description: 'Manage clients, bugs & features',     icon: <Briefcase className="w-5 h-5" />,     color: 'rose' },
  { key: 'research',       label: 'Research',        description: 'Papers, thesis & writing tracker',     icon: <BookOpen className="w-5 h-5" />,      color: 'teal' },
  { key: 'career',         label: 'Career & DSA',    description: 'Job applications, interviews & DSA',  icon: <GraduationCap className="w-5 h-5" />, color: 'orange' },
];

const colorMap: Record<string, string> = {
  blue:   'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  amber:  'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  green:  'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
  yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400',
  purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  sky:    'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  rose:   'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
  teal:   'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
  orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
};

interface Step3Props {
  selectedModules: ModuleKey[];
  onToggle: (key: ModuleKey) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Modules: React.FC<Step3Props> = ({ selectedModules, onToggle, onNext, onBack }) => {
  const selected = new Set(selectedModules);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Choose your workspace</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pick the sections you want. You can change this anytime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {MODULE_OPTIONS.map((mod) => {
          const isOn = mod.alwaysOn || selected.has(mod.key);
          const activeClass = isOn ? colorMap[mod.color] : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400';

          return (
            <button
              key={mod.key}
              onClick={() => !mod.alwaysOn && onToggle(mod.key)}
              disabled={mod.alwaysOn}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${activeClass} ${mod.alwaysOn ? 'cursor-default opacity-80' : 'hover:shadow-sm'}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">{mod.icon}</div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {mod.label}
                  {mod.alwaysOn && (
                    <span className="text-[9px] font-bold bg-current/10 px-1.5 py-0.5 rounded-full opacity-70">Always on</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500 leading-snug mt-0.5">{mod.description}</div>
              </div>

              {/* Check indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isOn ? 'border-current bg-current/20' : 'border-gray-300 dark:border-gray-600'}`}>
                {isOn && <Check className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl btn-primary text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
};
