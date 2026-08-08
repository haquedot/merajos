'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface Step1Props {
  displayName: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export const Step1Welcome: React.FC<Step1Props> = ({ displayName, onChange, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) onNext();
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-8 py-4"
    >
      {/* Icon */}
      <Logo variant="icon" size={64} />

      {/* Heading */}
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome to Orbit
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
          Your personal productivity command center. Let's set it up just for you — takes less than a minute.
        </p>
      </div>

      {/* Name Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
            What should we call you?
          </label>
          <input
            id="onboarding-name"
            type="text"
            autoFocus
            required
            value={displayName}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your name…"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!displayName.trim()}
          className="w-full py-3 rounded-xl btn-primary text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Let's Go →
        </button>
      </form>
    </motion.div>
  );
};
