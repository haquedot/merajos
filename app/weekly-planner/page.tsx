'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Sparkles,
  Trophy,
  Brain,
  CheckCircle2,
  TrendingUp,
  Target,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useWeeklyStore } from '../../store/useWeeklyStore';
import { Badge } from '../../components/ui/Badge';

export default function WeeklyPlannerPage() {
  const { plan, updatePlan, updateReview } = useWeeklyStore();

  const [wins, setWins] = useState(plan.review.wins);
  const [losses, setLosses] = useState(plan.review.losses);
  const [improvements, setImprovements] = useState(plan.review.improvements);
  const [score, setScore] = useState(plan.review.score);

  const handleReviewSave = () => {
    updateReview({
      wins,
      losses,
      improvements,
      score: Number(score) || 85,
    });
    alert('Weekly Review Saved!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Weekly Planning & Retrospective
              </h1>
              <p className="text-xs text-gray-500">
                Week {plan.weekId} • Align weekly goals across Research, Client Projects, Career, and Personal life
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-black">Weekly Score: {plan.review.score}/100</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Goals & Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Priorities for the Week */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Top 3 Objectives for This Week
            </h2>
          </div>

          <div className="space-y-2">
            {plan.topPriorities.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brain Dump & Quick Ideas */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Weekly Brain Dump & Ideas
            </h2>
          </div>

          <textarea
            value={plan.brainDump}
            onChange={(e) => updatePlan({ brainDump: e.target.value })}
            placeholder="Jot down quick thoughts, ideas, or reminders for next week..."
            className="w-full flex-1 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none min-h-[140px]"
          />
        </div>
      </div>

      {/* Category Weekly Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <Badge variant="purple" size="sm">Research Goals</Badge>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            {plan.researchGoals.map((g, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <Badge variant="success" size="sm">Career & DSA</Badge>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            {plan.careerGoals.map((g, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <Badge variant="info" size="sm">Client Projects</Badge>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            {plan.clientGoals.map((g, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <Badge variant="warning" size="sm">Personal & Health</Badge>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            {plan.personalGoals.map((g, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly Retrospective & Score Review */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              End-of-Week Review & Reflections
            </h2>
          </div>

          <button
            onClick={handleReviewSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
          >
            Save Weekly Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-emerald-500 mb-1">
              🚀 Wins & Highlights
            </label>
            <textarea
              rows={3}
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-rose-500 mb-1">
              ⚠️ Bottlenecks & Losses
            </label>
            <textarea
              rows={3}
              value={losses}
              onChange={(e) => setLosses(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-blue-500 mb-1">
              💡 Improvements for Next Week
            </label>
            <textarea
              rows={3}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Set Weekly Self-Assessment Score (0 - 100):
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-center text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
