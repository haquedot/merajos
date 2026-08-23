'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Task, Goal } from '../../types';
import { usePersonalizationStore } from '../../store/usePersonalizationStore';
import { generateTodayRecommendations } from '../../lib/personalization/decisions/decisionEngine';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';

interface SmartRecommendationCardProps {
  tasks: Task[];
  goals?: Goal[];
  onToggleMIT: (id: string) => void;
  onSetFocusTask: (id: string) => void;
}

export const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  tasks,
  goals = [],
  onToggleMIT,
  onSetFocusTask,
}) => {
  const { preferences, currentContext, acceptRecommendation, dismissRecommendation } =
    usePersonalizationStore();

  if (!preferences?.personalizationEnabled) return null;

  // Filter pending non-MIT tasks for recommendation candidates
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && !t.mit);
  if (pendingTasks.length === 0) return null;

  const recommendations = generateTodayRecommendations(pendingTasks, {
    goals,
    context: currentContext,
    preferences,
  });

  if (recommendations.length === 0) return null;

  const topRec = recommendations[0];
  const targetTask = pendingTasks.find((t) => t.id === topRec.entityId);
  if (!targetTask) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-orbit-blue/10 via-[#6D5BFF]/10 to-orbit-purple/10 border border-[#6D5BFF]/30 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#6D5BFF]/20 text-[#6D5BFF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Smart Focus Recommendation
            </span>
            <Badge variant="info" size="sm">
              Impact Score: {topRec.score}/100
            </Badge>
          </div>

          <button
            onClick={() => dismissRecommendation(topRec.id)}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            Dismiss
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{targetTask.title}</span>
              <Badge variant="secondary" size="sm">
                {targetTask.category || 'General'}
              </Badge>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{topRec.reason}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                acceptRecommendation(topRec.id);
                onToggleMIT(targetTask.id);
              }}
              className="h-8 px-3 text-xs font-bold bg-[#6D5BFF] hover:bg-[#5b49f0] text-white flex items-center gap-1.5 shadow-xs"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Set as #1 MIT</span>
            </Button>
          </div>
        </div>

        {topRec.evidence && topRec.evidence.length > 0 && (
          <div className="pt-2 border-t border-[#6D5BFF]/15 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Scoring Evidence:</span>
            {topRec.evidence.slice(0, 3).map((ev, idx) => (
              <span key={idx} className="bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-md">
                • {ev}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
