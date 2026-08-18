'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
  Calculator,
  TrendingUp,
  Info,
  CheckCircle2,
  Circle,
  Star,
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
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
      <div className="space-y-5">
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
              Activity Overview
            </h4>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {breakdownItems.length} active areas
          </span>
        </div>

        {/* Activity Cards List */}
        {breakdownItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            No tasks or habits scheduled for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const friendlyTitle = getFriendlyTitle(item.label, item.category);
              const isCategoryExpanded = !!expandedCategories[item.id];
              const hasItems = item.itemList && item.itemList.length > 0;

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 space-y-2.5 transition-all"
                >
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

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        {item.percentage}% Done
                      </span>

                      {hasItems && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(item.id)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                          title="View exact tasks"
                        >
                          {isCategoryExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
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

                  {/* Collapsible Exact Items List (Task / Habit Titles) */}
                  {hasItems && isCategoryExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1.5"
                    >
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        Exact Items ({item.itemList!.length}):
                      </span>
                      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                        {item.itemList!.map((subItem) => (
                          <div
                            key={subItem.id}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                              subItem.isCompleted
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                                : 'bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {subItem.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                              <span className={`font-semibold truncate ${subItem.isCompleted ? 'line-through opacity-80' : ''}`}>
                                {subItem.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {subItem.isMit && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-current" /> MIT
                                </span>
                              )}
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                subItem.isCompleted
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}>
                                {subItem.isCompleted ? `+${subItem.pointsEarned} pts` : `0 / ${subItem.maxPoints} pts`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Accordion Toggle for Technical / Power Users */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-between gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              <span>Detailed Points & Exact Calculation Formula</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold">
              <span>{showDetails ? 'Hide Details' : 'Show Points & Math'}</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Accordion Content */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4 text-xs">
                  {/* Total Points Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      Itemized Point Breakdown ({totalPointsEarned} total pts)
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                      Calculated dynamically
                    </span>
                  </div>

                  {/* Itemized List with Exact Points, Max Points & Tasks List */}
                  <div className="space-y-3">
                    {breakdownItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200/60 dark:border-gray-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 dark:text-white block truncate">
                              {item.label}
                            </span>
                            <span className="text-[11px] text-gray-500 truncate block">
                              {item.details}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-sm text-gray-900 dark:text-white block">
                              +{item.pointsEarned} <span className="text-[10px] text-gray-400 font-normal">/ {item.maxPoints} pts</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                              {item.percentage}% completion
                            </span>
                          </div>
                        </div>

                        {/* List of actual tasks/activities inside detailed math accordion */}
                        {item.itemList && item.itemList.length > 0 && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60 space-y-1">
                            {item.itemList.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between text-[11px] py-0.5">
                                <div className="flex items-center gap-1.5 truncate">
                                  {sub.isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  )}
                                  <span className={sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300 font-medium'}>
                                    {sub.title}
                                  </span>
                                  {sub.isMit && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-1 rounded">MIT</span>}
                                </div>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  sub.isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                }`}>
                                  {sub.isCompleted ? `+${sub.pointsEarned} pts` : `0 / ${sub.maxPoints} pts`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Mathematical Formula Explanation Box */}
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-indigo-900 dark:text-indigo-300">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-[11px] leading-relaxed">
                      <span className="font-bold block">Calculation Formula:</span>
                      <p>
                        Daily Score = <strong>40% Core Tasks & MITs</strong> + <strong>60% Active Routines</strong> (Habit streaks, goal progress, client work, research & career problems).
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
