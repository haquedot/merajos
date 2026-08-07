'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, FlaskConical, Building2, Sliders } from 'lucide-react';
import { UserRole, ModuleKey } from '../../../types';

interface RoleOption {
  key: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  presetModules: ModuleKey[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'student',
    label: 'Student',
    description: 'Classes, research, assignments, career prep',
    icon: <GraduationCap className="w-6 h-6" />,
    presetModules: ['tasks', 'calendar', 'habits', 'goals', 'research', 'career', 'notes', 'weekly_planner'],
  },
  {
    key: 'freelancer',
    label: 'Freelancer',
    description: 'Client projects, deadlines, invoicing',
    icon: <Briefcase className="w-6 h-6" />,
    presetModules: ['tasks', 'calendar', 'habits', 'goals', 'clients', 'notes', 'weekly_planner', 'analytics'],
  },
  {
    key: 'researcher',
    label: 'Researcher',
    description: 'Papers, thesis, writing progress',
    icon: <FlaskConical className="w-6 h-6" />,
    presetModules: ['tasks', 'calendar', 'habits', 'research', 'goals', 'notes', 'weekly_planner'],
  },
  {
    key: 'professional',
    label: 'Professional',
    description: 'Career growth, goals, work tasks',
    icon: <Building2 className="w-6 h-6" />,
    presetModules: ['tasks', 'calendar', 'habits', 'career', 'goals', 'notes', 'analytics', 'weekly_planner'],
  },
  {
    key: 'custom',
    label: 'Build My Own',
    description: 'Pick exactly what you need',
    icon: <Sliders className="w-6 h-6" />,
    presetModules: ['tasks', 'calendar'],
  },
];

interface Step2Props {
  selectedRole: UserRole;
  onSelect: (role: UserRole, presetModules: ModuleKey[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Role: React.FC<Step2Props> = ({ selectedRole, onSelect, onNext, onBack }) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">What best describes you?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">We'll pre-select the right tools for your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role.key;
          return (
            <button
              key={role.key}
              onClick={() => onSelect(role.key, role.presetModules)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-md shadow-blue-500/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {role.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-white'}`}>
                  {role.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{role.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedRole}
          className="flex-1 py-3 rounded-xl btn-primary text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-40 active:scale-95"
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
};
