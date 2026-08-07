'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target } from 'lucide-react';

interface Step4Props {
  workStartTime: string;
  workEndTime: string;
  primaryGoal: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onChangeGoal: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_OPTIONS = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00',
];

export const Step4Routine: React.FC<Step4Props> = ({
  workStartTime, workEndTime, primaryGoal,
  onChangeStart, onChangeEnd, onChangeGoal,
  onNext, onBack,
}) => {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your daily routine</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Help Orbit understand when you work and what you're aiming for.</p>
      </div>

      {/* Work Hours */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4 text-blue-500" />
          When do you usually work?
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">Start</div>
            <select
              value={workStartTime}
              onChange={(e) => onChangeStart(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="text-gray-400 font-bold text-lg mt-4">→</div>
          <div className="flex-1">
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">End</div>
            <select
              value={workEndTime}
              onChange={(e) => onChangeEnd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Goal */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Target className="w-4 h-4 text-green-500" />
          What's your main goal right now?
        </label>
        <textarea
          value={primaryGoal}
          onChange={(e) => onChangeGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Land a software engineering job, finish my thesis, grow my freelance income…"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl btn-primary text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95"
        >
          Almost Done →
        </button>
      </div>
    </motion.div>
  );
};
