'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ListCheck,
  ChevronRight,
} from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { Goal, GoalTier, Priority } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';

import { GridCardsSkeleton } from '../../components/ui/Skeleton';

export default function GoalsPage() {
  const {
    goals,
    isLoading: isLoadingGoals,
    selectedTierFilter,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    setSelectedTierFilter,
  } = useGoalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // New Goal form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<GoalTier>('quarter');
  const [priority, setPriority] = useState<Priority>('high');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  if (isLoadingGoals) {
    return <GridCardsSkeleton count={4} />;
  }

  const filteredGoals = goals.filter(
    (g) => selectedTierFilter === 'all' || g.tier === selectedTierFilter
  );

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      description: description.trim(),
      tier,
      targetDate,
      progress: 0,
      priority,
      milestones: [
        { id: `m-1`, title: 'Define initial milestone', completed: false },
      ],
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestoneTitle.trim()) return;
    addMilestone(goalId, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <PageHeader
        icon={Target}
        iconBgColor="bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400"
        title="Strategic Goals & Milestones"
        badgeText={`${filteredGoals.length} Goals`}
        badgeVariant="rose"
        subtitle="Break down long-term objectives into quarterly, monthly, and weekly actionable milestones"
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Filter Tabs */}
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-0"
            >
              <option value="all">All Goal Horizons</option>
              <option value="long_term">Long-term Goals</option>
              <option value="quarter">Quarter Goals (Q3/Q4)</option>
              <option value="monthly">Monthly Goals</option>
              <option value="weekly">Weekly Goals</option>
              <option value="daily">Daily Goals</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>
        }
      />

      {/* Goals Cards List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredGoals.map((goal) => {
          const completedCount = goal.milestones.filter((m) => m.completed).length;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={goal.tier === 'long_term' ? 'purple' : 'info'} size="sm">
                      {goal.tier.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={goal.priority === 'urgent' ? 'danger' : 'warning'} size="sm">
                      {goal.priority}
                    </Badge>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-gray-400 hover:text-rose-500 text-xs ml-auto sm:hidden"
                      title="Delete Goal"
                    >
                      Delete
                    </button>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                    {goal.title}
                  </h2>
                  {goal.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Deadline: {goal.targetDate}</span>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center gap-3.5 bg-gray-50 dark:bg-gray-800/40 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 w-full sm:w-auto justify-between sm:justify-start shrink-0">
                  <CircularProgress
                    percentage={goal.progress}
                    size={70}
                    strokeWidth={7}
                    color={goal.progress === 100 ? '#10b981' : '#f43f5e'}
                    showText={true}
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {goal.progress === 100 ? '🎉 Achieved!' : 'In Progress'}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {completedCount} of {goal.milestones.length} milestones
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-rose-500 text-xs hidden sm:block ml-2"
                    title="Delete Goal"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  <span>Key Milestones</span>
                  <span>{goal.progress}% Complete</span>
                </div>

                <div className="space-y-2">
                  {goal.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(goal.id, m.id)}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                            m.completed ? 'bg-rose-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {m.completed && '✓'}
                        </div>
                        <span
                          className={`text-xs font-semibold truncate ${
                            m.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Milestone Row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add new milestone..."
                    value={activeGoalId === goal.id ? newMilestoneTitle : ''}
                    onFocus={() => setActiveGoalId(goal.id)}
                    onChange={(e) => {
                      setActiveGoalId(goal.id);
                      setNewMilestoneTitle(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone(goal.id);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white min-w-0"
                  />
                  <button
                    onClick={() => handleAddMilestone(goal.id)}
                    className="btn-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Strategic Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Publish Research Paper on Attention Efficiency"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your key success criteria..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Goal Horizon Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as GoalTier)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="long_term">Long Term</option>
                <option value="quarter">Quarterly (Q3/Q4)</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
