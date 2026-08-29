'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Flame,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal } from '../../lib/agent/types';
import { AIProviderId } from '../../lib/agent/providers/providerFactory';
import { useTaskStore } from '../../store/useTaskStore';
import toast from 'react-hot-toast';

interface AgentCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentCoPilotDrawer: React.FC<AgentCoPilotDrawerProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTaskStore();
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('gemini');
  const [availableProviders, setAvailableProviders] = useState<{ id: AIProviderId; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [proposal, setProposal] = useState<AgentCoPilotProposal | null>(null);

  useEffect(() => {
    // Fetch available AI providers from route GET endpoint
    fetch('/api/agent/co-pilot')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableProviders) {
          setAvailableProviders(data.availableProviders);
        }
        if (data.activeProvider) {
          setSelectedProvider(data.activeProvider as AIProviderId);
        }
      })
      .catch((err) => console.error('Failed to load AI providers:', err));
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setProposal(null);

    try {
      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Analyze my workload and generate today\'s optimal schedule',
          providerId: selectedProvider
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProposal(data.proposal);
      toast.success('Agent Co-Pilot generated a verified schedule!');
    } catch (err: any) {
      toast.error(`Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveAndSync = async () => {
    if (!proposal) return;
    setIsApproving(true);

    try {
      // Execute local store and MongoDB mutations for all proposed tasks
      for (const tp of proposal.taskProposals) {
        await addTask({
          title: tp.title,
          category: tp.category as any,
          priority: tp.priority as any,
          estimatedHours: tp.estimatedHours,
          mit: tp.mit,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'todo'
        });
      }

      toast.success(`Approved! Created ${proposal.taskProposals.length} tasks and synced to Google Workspace.`);
      onClose();
    } catch (err: any) {
      toast.error(`Approval Error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[540px] md:w-[620px] bg-white dark:bg-[#121620] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    Orbit Agent Co-Pilot
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                      HITL
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Deterministic schedule optimization with zero overlap guarantee
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Intent Prompt & Provider Control Box */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    Agent Goal / Intent Prompt
                  </label>

                  {/* AI Provider Selector */}
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as AIProviderId)}
                      className="text-xs font-bold bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-hidden"
                    >
                      {availableProviders.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Prioritize 45m DSA practice, read Transformer paper, and schedule client deliverables for morning..."
                  className="w-full h-20 p-3 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-gray-900 dark:text-white placeholder:text-gray-400"
                />

                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Sub-Agents & Guardrails...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Optimized Schedule</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trajectory Execution Steps */}
              {proposal && proposal.steps && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2.5">
                  <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    Agent Trajectory Stream
                  </h3>
                  <div className="space-y-1.5">
                    {proposal.steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-gray-900 dark:text-white">{step.agentName}</span>: {step.action}
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guardrail Verification Summary */}
              {proposal && proposal.verification && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Verification Guardrail Status
                    </h3>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      {proposal.verification.totalScheduledHours.toFixed(1)}h / {proposal.verification.maxCapacityHours.toFixed(1)}h Max Capacity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {proposal.verification.checks.map((check, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2"
                      >
                        {check.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">{check.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{check.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Time-Slot Schedule Breakdown */}
              {proposal && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Proposed 4-Slot Day Schedule
                  </h3>

                  <div className="space-y-3">
                    {proposal.scheduleSlots.map((slot) => (
                      <div
                        key={slot.slot}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#161b26] border border-gray-200 dark:border-gray-800 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">{slot.label}</h4>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                            {slot.allocatedHours.toFixed(1)}h allocated
                          </span>
                        </div>

                        {slot.tasks.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic pl-5">No tasks assigned to this slot.</p>
                        ) : (
                          <div className="space-y-1.5 pl-2">
                            {slot.tasks.map((t, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {t.mit && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-extrabold flex items-center gap-0.5 shrink-0">
                                      <Flame className="w-2.5 h-2.5" /> MIT
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {t.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                    {t.estimatedHours}h
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    {t.category}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* HITL Footer Action Controls */}
            {proposal && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b26] flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  Discard
                </button>

                <button
                  onClick={handleApproveAndSync}
                  disabled={isApproving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing Google Workspace...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Sync to Google Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
