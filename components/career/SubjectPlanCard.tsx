'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { SubjectPlan } from '../../types';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../store/useCareerStore';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface SubjectPlanCardProps {
  plan: SubjectPlan;
  onAddTopic: (subjectId: string) => void;
}

export const SubjectPlanCard: React.FC<SubjectPlanCardProps> = ({ plan, onAddTopic }) => {
  const { deleteSubjectPlan } = useCareerStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Calculate completion percentage
  let totalItems = 0;
  let completedItems = 0;

  plan.topics.forEach((t) => {
    t.checklist.forEach((c) => {
      totalItems++;
      if (c.completed) completedItems++;
    });
  });

  const progressPerc = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5 flex flex-col justify-between"
      >
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: plan.colorTheme || '#1F3B99' }}
                />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {plan.title}
                </h3>
                <Badge variant="info" size="sm">
                  {plan.category}
                </Badge>
              </div>
              {plan.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => onAddTopic(plan.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Topic</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Subject Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orbit-orange" />
                <span>Overall Plan Mastery</span>
              </span>
              <span className="font-black text-orbit-blue">
                {completedItems}/{totalItems} Items ({progressPerc}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPerc}%`,
                  backgroundColor: plan.colorTheme || '#0066FF',
                }}
              />
            </div>
          </div>

          {/* Topics Preview List */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">
              Topics Overview ({plan.topics.length})
            </span>
            {plan.topics.length === 0 ? (
              <div className="p-4 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                No topics added yet. Click "Add Topic" above to start!
              </div>
            ) : (
              <div className="space-y-1.5">
                {plan.topics.slice(0, 3).map((topic) => {
                  const topicCompleted = topic.checklist.filter((c) => c.completed).length;
                  const topicTotal = topic.checklist.length;
                  const perc = topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 0;

                  return (
                    <div
                      key={topic.id}
                      className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {perc === 100 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-orbit-orange shrink-0" />
                        )}
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                          {topic.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-extrabold text-gray-400 shrink-0 ml-2">
                        {topicCompleted}/{topicTotal}
                      </span>
                    </div>
                  );
                })}

                {plan.topics.length > 3 && (
                  <p className="text-[11px] font-bold text-gray-400 text-center pt-1">
                    + {plan.topics.length - 3} more topics in reader
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Open Reader Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <Link
            href={`/career/${plan.id}`}
            className="w-full py-2.5 px-4 rounded-2xl bg-orbit-blue hover:bg-orbit-blue-hover text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <span>Open Study Reader</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteSubjectPlan(plan.id)}
        title="Delete Subject Plan"
        itemName={plan.title}
        message="Are you sure you want to delete this subject plan and all its underlying curriculum topics?"
      />
    </>
  );
};
