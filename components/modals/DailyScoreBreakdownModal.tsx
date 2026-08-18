'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  X,
  Sparkles,
  CheckSquare,
  Flame,
  Target,
  Briefcase,
  BookOpen,
  GraduationCap,
  Info,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ScoreBreakdownItem } from '../../lib/productivityCalculator';
import { CircularProgress } from '../ui/CircularProgress';
import { Badge } from '../ui/Badge';

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

  // Determine Performance Rank & Color based on score
  const getRankBadge = (score: number) => {
    if (score >= 90) return { label: 'Apex Performer 🏆', color: 'emerald', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (score >= 75) return { label: 'High Productivity 🔥', color: 'blue', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    if (score >= 50) return { label: 'On Track ⚡', color: 'purple', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    if (score > 0) return { label: 'In Progress 🎯', color: 'amber', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { label: 'Not Started Yet 🚀', color: 'gray', bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30' };
  };

  const rank = getRankBadge(dailyScore);
  const totalPointsEarned = breakdownItems.reduce((acc, item) => acc + item.pointsEarned, 0);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Daily Score Breakdown (${dateTitle})`} maxWidth="lg">
      <div className="space-y-6">
        {/* Top Hero Banner: Circular Score Ring & Rank */}
        <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white overflow-hidden shadow-xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 z-10">
            <div className="relative shrink-0">
              <CircularProgress
                percentage={dailyScore}
                size={84}
                strokeWidth={8}
                color={dailyScore >= 75 ? '#34D399' : dailyScore >= 50 ? '#818CF8' : '#FBBF24'}
                trailColor="rgba(255, 255, 255, 0.1)"
                showText={false}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black tracking-tight">{dailyScore}</span>
                <span className="text-[10px] text-gray-300 font-bold uppercase -mt-1">/ 100</span>
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md bg-white/10 text-white border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{rank.label}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Productivity Calculation
              </h3>
              <p className="text-xs text-gray-300">
                {totalPointsEarned} total points earned across {breakdownItems.length} active modules today.
              </p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
              Point Breakdown by Activity
            </h4>
          </div>
          <span className="text-xs text-gray-400 font-semibold">
            Weight Breakdown
          </span>
        </div>

        {/* Breakdown Items List */}
        {breakdownItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            No active tasks or routines recorded for this date yet.
          </div>
        ) : (
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const Icon = getCategoryIcon(item.category);

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-800 space-y-2.5 transition-all hover:border-indigo-200 dark:hover:border-indigo-900"
                >
                  {/* Category Header & Points Earned */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white block truncate">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                          {item.details}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-gray-900 dark:text-white block">
                        +{item.pointsEarned} <span className="text-[10px] text-gray-400 font-normal">/ {item.maxPoints} pts</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        {item.percentage}% completion
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
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

        {/* How it Works Footer Callout */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-300">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">How Orbit Daily Score is Weighted:</span>
            <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300/80">
              Score is calculated dynamically: <strong>40% Core Tasks & Most Important Tasks (MITs)</strong> + <strong>60% Active Routines</strong> (Habit streaks, goal progress, client work, research & career problems).
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
