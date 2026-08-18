'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckSquare,
  Flame,
  Target,
  Briefcase,
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ScoreBreakdownItem } from '../../lib/productivityCalculator';
import { CircularProgress } from '../ui/CircularProgress';

interface DailyScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyScore: number;
  breakdownItems: ScoreBreakdownItem[];
  dateTitle?: string;
}

export const DailyScoreBreakdownModal: React.FC<DailyScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  dailyScore,
  breakdownItems,
  dateTitle = 'Today',
}) => {
  if (!isOpen) return null;

  // Friendly human rank, message, and guidance based on daily score
  const getHumanMotivation = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Superstar Day 🏆',
        message: 'Outstanding work! You crushed almost all your goals today.',
        encouragement: 'Keep this momentum going for tomorrow!',
        color: '#10B981',
      };
    }
    if (score >= 75) {
      return {
        label: 'Great Progress 🔥',
        message: "You're having a very productive day!",
        encouragement: 'Finish up your remaining tasks to hit 90%+',
        color: '#3B82F6',
      };
    }
    if (score >= 50) {
      return {
        label: 'On Track ⚡',
        message: 'Good steady progress today.',
        encouragement: 'Complete 1 or 2 more tasks to push your score higher.',
        color: '#8B5CF6',
      };
    }
    if (score > 0) {
      return {
        label: 'Getting Started 🌱',
        message: "You've started making progress today.",
        encouragement: 'Check off your top priority tasks to boost your score!',
        color: '#F59E0B',
      };
    }
    return {
      label: 'Not Started Yet 🚀',
      message: 'No activities completed for this date yet.',
      encouragement: 'Check off your first task or habit to get on the board!',
      color: '#6B7280',
    };
  };

  const motivation = getHumanMotivation(dailyScore);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tasks': return CheckSquare;
      case 'habits': return Flame;
      case 'goals': return Target;
      case 'projects': return Briefcase;
      case 'research': return BookOpen;
      case 'career': return GraduationCap;
      default: return Sparkles;
    }
  };

  // Simplify category titles for everyday users
  const getFriendlyTitle = (label: string, category: string) => {
    switch (category) {
      case 'tasks': return 'Daily Tasks & Priorities';
      case 'habits': return 'Habits Routine';
      case 'goals': return 'Quarterly Goals';
      case 'projects': return 'Client Work & Projects';
      case 'research': return 'Research Reading';
      case 'career': return 'Career Prep & DSA';
      default: return label;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Productivity Summary (${dateTitle})`} maxWidth="lg">
      <div className="space-y-6">
        {/* Top Hero Banner: Friendly Score & Human Encouragement */}
        <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white overflow-hidden shadow-xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4.5 z-10 w-full sm:w-auto">
            {/* Score Ring */}
            <div className="relative shrink-0">
              <CircularProgress
                percentage={dailyScore}
                size={86}
                strokeWidth={8}
                color={motivation.color}
                trailColor="rgba(255, 255, 255, 0.12)"
                showText={false}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black tracking-tight">{dailyScore}%</span>
                <span className="text-[9px] text-gray-300 font-bold uppercase -mt-1">Score</span>
              </div>
            </div>

            {/* Motivation Header */}
            <div className="space-y-1 text-left min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border backdrop-blur-md bg-white/10 text-white border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{motivation.label}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {motivation.message}
              </h3>
              <p className="text-xs text-gray-300/90 leading-relaxed">
                {motivation.encouragement}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Section Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
              Activity Progress Breakdown
            </h4>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {breakdownItems.length} active areas
          </span>
        </div>

        {/* Breakdown Items List */}
        {breakdownItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            No tasks or habits scheduled for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const friendlyTitle = getFriendlyTitle(item.label, item.category);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 space-y-2.5 transition-all"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white block truncate">
                          {friendlyTitle}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                          {item.details}
                        </span>
                      </div>
                    </div>

                    {/* Completion Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        {item.percentage}% Done
                      </span>
                    </div>
                  </div>

                  {/* Clean Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How to Boost Your Score - Simple Guidance Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2 text-xs text-indigo-950 dark:text-indigo-200">
          <div className="flex items-center gap-2 font-extrabold text-indigo-900 dark:text-indigo-300">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>How to increase your Daily Score:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-indigo-800 dark:text-indigo-300/90 pl-6 list-disc leading-relaxed">
            <li><strong>Complete your Top Priority Tasks (MITs)</strong> for the biggest score boost.</li>
            <li><strong>Maintain your Habit Streaks & Goals</strong> to keep your momentum growing every day.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
