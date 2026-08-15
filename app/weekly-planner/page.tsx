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
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

import { DashboardSkeleton } from '../../components/ui/Skeleton';

export default function WeeklyPlannerPage() {
  const { plan, isLoading: isLoadingWeekly, updatePlan, updateReview } = useWeeklyStore();

  const [wins, setWins] = useState(plan.review.wins);
  const [losses, setLosses] = useState(plan.review.losses);
  const [improvements, setImprovements] = useState(plan.review.improvements);
  const [score, setScore] = useState(plan.review.score);

  // New goal inputs for categories
  const [newResearchGoal, setNewResearchGoal] = useState('');
  const [newCareerGoal, setNewCareerGoal] = useState('');
  const [newClientGoal, setNewClientGoal] = useState('');
  const [newPersonalGoal, setNewPersonalGoal] = useState('');

  if (isLoadingWeekly) {
    return <DashboardSkeleton />;
  }

  const handleReviewSave = () => {
    updateReview({
      wins,
      losses,
      improvements,
      score: Number(score) || 85,
    });
  };

  const priorities = [
    plan.topPriorities[0] || '',
    plan.topPriorities[1] || '',
    plan.topPriorities[2] || '',
  ];

  const handlePriorityChange = (index: number, val: string) => {
    const next = [...priorities];
    next[index] = val;
    updatePlan({ topPriorities: next });
  };

  const handleAddCategoryGoal = (
    categoryKey: 'researchGoals' | 'careerGoals' | 'clientGoals' | 'personalGoals',
    text: string,
    setText: (val: string) => void
  ) => {
    if (!text.trim()) return;
    const current = plan[categoryKey] || [];
    updatePlan({ [categoryKey]: [...current, text.trim()] });
    setText('');
  };

  const handleRemoveCategoryGoal = (
    categoryKey: 'researchGoals' | 'careerGoals' | 'clientGoals' | 'personalGoals',
    index: number
  ) => {
    const current = plan[categoryKey] || [];
    updatePlan({ [categoryKey]: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <PageHeader
        icon={CalendarDays}
        iconBgColor="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
        title="Weekly Planning & Retrospective"
        badgeText={`Week ${plan.weekId}`}
        badgeVariant="blue"
        subtitle="Align weekly goals across Research, Client Projects, Career, and Personal life"
        actions={
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shrink-0 self-start sm:self-auto">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            <span className="text-xs sm:text-sm font-black">Weekly Score: {plan.review.score}/100</span>
          </div>
        }
      />

      {/* Grid Layout: Goals & Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Priorities for the Week */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
              Top 3 Objectives for This Week
            </h2>
          </div>

          <div className="space-y-2.5">
            {priorities.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {idx + 1}
                </span>
                <Input
                  value={item}
                  onChange={(e) => handlePriorityChange(idx, e.target.value)}
                  placeholder={`Objective ${idx + 1}...`}
                  className="flex-1 min-w-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Brain Dump & Quick Ideas */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4 flex flex-col">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
              Weekly Brain Dump & Ideas
            </h2>
          </div>

          <textarea
            value={plan.brainDump}
            onChange={(e) => updatePlan({ brainDump: e.target.value })}
            placeholder="Jot down quick thoughts, ideas, or reminders for next week..."
            className="w-full flex-1 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none min-h-[120px]"
          />
        </div>
      </div>

      {/* Category Weekly Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Research Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="purple" size="sm">Research Goals</Badge>
              <span className="text-[10px] text-gray-400 font-medium">{plan.researchGoals.length} goals</span>
            </div>

            {plan.researchGoals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">No research goals set.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {plan.researchGoals.map((g, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span className="truncate">{g}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCategoryGoal('researchGoals', idx)}
                      className="text-gray-400 hover:text-rose-500 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategoryGoal('researchGoals', newResearchGoal, setNewResearchGoal);
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Input
              value={newResearchGoal}
              onChange={(e) => setNewResearchGoal(e.target.value)}
              placeholder="Add goal..."
              className="flex-1 min-w-0"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="shrink-0 p-2"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Career Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm">Career & DSA</Badge>
              <span className="text-[10px] text-gray-400 font-medium">{plan.careerGoals.length} goals</span>
            </div>

            {plan.careerGoals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">No career goals set.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {plan.careerGoals.map((g, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{g}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCategoryGoal('careerGoals', idx)}
                      className="text-gray-400 hover:text-rose-500 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategoryGoal('careerGoals', newCareerGoal, setNewCareerGoal);
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Input
              value={newCareerGoal}
              onChange={(e) => setNewCareerGoal(e.target.value)}
              placeholder="Add goal..."
              className="flex-1 min-w-0"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="shrink-0 p-2"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Client Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm">Client Projects</Badge>
              <span className="text-[10px] text-gray-400 font-medium">{plan.clientGoals.length} goals</span>
            </div>

            {plan.clientGoals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">No client goals set.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {plan.clientGoals.map((g, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{g}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCategoryGoal('clientGoals', idx)}
                      className="text-gray-400 hover:text-rose-500 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategoryGoal('clientGoals', newClientGoal, setNewClientGoal);
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Input
              value={newClientGoal}
              onChange={(e) => setNewClientGoal(e.target.value)}
              placeholder="Add goal..."
              className="flex-1 min-w-0"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="shrink-0 p-2"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Personal Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">Personal & Health</Badge>
              <span className="text-[10px] text-gray-400 font-medium">{plan.personalGoals.length} goals</span>
            </div>

            {plan.personalGoals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">No personal goals set.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {plan.personalGoals.map((g, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{g}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCategoryGoal('personalGoals', idx)}
                      className="text-gray-400 hover:text-rose-500 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategoryGoal('personalGoals', newPersonalGoal, setNewPersonalGoal);
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <Input
              value={newPersonalGoal}
              onChange={(e) => setNewPersonalGoal(e.target.value)}
              placeholder="Add goal..."
              className="flex-1 min-w-0"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="shrink-0 p-2"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Weekly Retrospective & Score Review */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
              End-of-Week Review & Reflections
            </h2>
          </div>

          <button
            onClick={handleReviewSave}
            className="btn-primary px-4 py-2 rounded-xl text-xs w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Save Weekly Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-emerald-500 mb-1.5">
              🚀 Wins & Highlights
            </label>
            <textarea
              rows={3}
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="What went exceptionally well this week?"
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-rose-500 mb-1.5">
              ⚠️ Bottlenecks & Losses
            </label>
            <textarea
              rows={3}
              value={losses}
              onChange={(e) => setLosses(e.target.value)}
              placeholder="What blocked your progress?"
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-blue-500 mb-1.5">
              💡 Improvements for Next Week
            </label>
            <textarea
              rows={3}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Actionable steps for next week..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300">
            <span>Weekly Self-Assessment Score:</span>
            <span className="text-amber-500 font-black">{score}/100</span>
          </div>

          <div className="flex items-center gap-3 w-full xs:w-auto justify-between xs:justify-end">
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full xs:w-32 sm:w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-16 text-center shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
