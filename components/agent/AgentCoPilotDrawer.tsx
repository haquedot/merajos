'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Briefcase,
  History,
  Trash2,
  Check,
  Brain,
  ChevronDown,
  ChevronUp,
  Wand2
} from 'lucide-react';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal } from '../../lib/agent/types';
import { AIProviderId, DEFAULT_AI_PROVIDER } from '../../lib/agent/providers/providerFactory';
import { useTaskStore } from '../../store/useTaskStore';
import { getAuthHeaders } from '../../lib/authCheck';
import {
  CoPilotHistoryItem,
  getCoPilotHistory,
  saveCoPilotHistoryItem,
  markHistoryApproved,
  clearCoPilotHistory
} from '../../lib/agent/historyStore';
import toast from 'react-hot-toast';

interface AgentCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENERATION_STEPS = [
  'Ingesting user intent & workload context...',
  'Orchestrating sub-agents (Career, Research, Tasks)...',
  'Evaluating 0-overlap calendar constraints...',
  'Formatting MIT task proposals...'
];

export const AgentCoPilotDrawer: React.FC<AgentCoPilotDrawerProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'history'>('copilot');
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(DEFAULT_AI_PROVIDER);
  const [availableProviders, setAvailableProviders] = useState<{ id: AIProviderId; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [proposal, setProposal] = useState<AgentCoPilotProposal | null>(null);
  const [historyItems, setHistoryItems] = useState<CoPilotHistoryItem[]>([]);

  useEffect(() => {
    setMounted(true);
    setHistoryItems(getCoPilotHistory());

    const loadProviders = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/agent/co-pilot', { headers });
        const data = await res.json();
        if (data.availableProviders) {
          setAvailableProviders(data.availableProviders);
        }
        if (data.activeProvider) {
          setSelectedProvider(data.activeProvider as AIProviderId);
        }
      } catch (err) {
        console.error('Failed to load AI providers:', err);
      }
    };

    loadProviders();
  }, []);

  const refreshHistory = () => {
    setHistoryItems(getCoPilotHistory());
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGeneratingStep(0);
    setProposal(null);

    const stepInterval = setInterval(() => {
      setGeneratingStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const headers = await getAuthHeaders();
      const userPromptText = prompt.trim() || 'Analyze my workload and generate today\'s optimal schedule';

      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: userPromptText,
          providerId: selectedProvider
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProposal(data.proposal);

      // Save run to local history store
      saveCoPilotHistoryItem({
        id: data.proposal.proposalId,
        timestamp: new Date().toISOString(),
        prompt: userPromptText,
        providerUsed: selectedProvider,
        status: 'generated',
        taskCount: data.proposal.taskProposals.length,
        totalHours: data.proposal.verification.totalScheduledHours,
        taskProposals: data.proposal.taskProposals
      });
      refreshHistory();

      toast.success('Agent Co-Pilot generated a verified schedule!');
    } catch (err: any) {
      toast.error(`Generation Error: ${err.message}`);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const handleApproveAndSync = async () => {
    if (!proposal) return;
    setIsApproving(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrowObj = new Date();
      tomorrowObj.setDate(tomorrowObj.getDate() + 1);
      const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
      const isTomorrowPrompt = proposal.userIntent.toLowerCase().includes('tomorrow');

      // Execute store mutations for all proposed tasks
      for (const tp of proposal.taskProposals) {
        const dueDate = tp.targetDate || (isTomorrowPrompt ? tomorrowStr : todayStr);

        await addTask({
          title: tp.title,
          category: tp.category as any,
          priority: tp.priority as any,
          estimatedHours: tp.estimatedHours,
          actualHours: 0,
          mit: tp.mit,
          dueDate,
          status: 'todo',
          recurring: 'none',
          tags: []
        });
      }

      // Mark history status as approved & clear active proposal view
      markHistoryApproved(proposal.proposalId);
      refreshHistory();

      toast.success(`Approved! Created ${proposal.taskProposals.length} tasks and synced to Google Workspace.`);

      // Reset state cleanly so proposal disappears from active view
      setProposal(null);
      setPrompt('');
    } catch (err: any) {
      toast.error(`Approval Error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDiscardProposal = () => {
    setProposal(null);
    toast('Proposal discarded', { icon: '🗑️' });
  };

  const handleClearHistory = () => {
    clearCoPilotHistory();
    refreshHistory();
    toast.success('Co-Pilot run history cleared.');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[10000] w-full sm:w-[540px] md:w-[620px] bg-white dark:bg-[#121620] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
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

              {/* Navigation Tabs (Co-Pilot vs Execution History) */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-800/60">
                <button
                  onClick={() => setActiveTab('copilot')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'copilot'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agent Optimizer</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('history');
                    refreshHistory();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Run History</span>
                  {historyItems.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-white/20 text-white">
                      {historyItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {activeTab === 'history' ? (
                /* Execution History View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-blue-500" />
                      Past Execution Trajectories ({historyItems.length})
                    </h3>
                    {historyItems.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear History
                      </button>
                    )}
                  </div>

                  {historyItems.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-[#181d2a] border border-dashed border-gray-300 dark:border-gray-800 space-y-2">
                      <History className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400">No execution history found</p>
                      <p className="text-[11px] text-gray-400">Run the Co-Pilot optimizer to record approved proposals here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-gray-50 dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                item.status === 'approved'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                              }`}
                            >
                              {item.status === 'approved' ? '✓ Approved' : 'Generated'}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            "{item.prompt}"
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-200/60 dark:border-gray-800/60 pt-2">
                            <span>Provider: <strong className="text-gray-700 dark:text-gray-300 capitalize">{item.providerUsed}</strong></span>
                            <span>•</span>
                            <span>Tasks: <strong>{item.taskCount}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong>{item.totalHours}h</strong></span>
                          </div>

                          {/* Task List Snippet */}
                          <div className="space-y-1 pt-1">
                            {item.taskProposals.map((tp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                                <span className="truncate flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                  {tp.title}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">
                                  {tp.timeSlot}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Co-Pilot Interactive Optimizer View */
                <>
                  {/* Empty State Banner when no proposal & not generating */}
                  {!proposal && !isGenerating && (
                    <div className="p-8 text-center rounded-2xl bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-dashed border-blue-200 dark:border-blue-900/50 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        What should Orbit Co-Pilot plan for you today?
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed font-medium">
                        Type any schedule directive below (e.g. <em>"Create a task for tomorrow afternoon to prepare for the senior hostel interview"</em>) and Orbit will orchestrate a verified schedule.
                      </p>
                    </div>
                  )}

                  {/* Interactive Live Thinking State while Generating */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-3 shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                          <Brain className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-blue-900 dark:text-blue-200">
                            Orbit Co-Pilot is thinking...
                          </p>
                          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mt-0.5">
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                            {GENERATION_STEPS[generatingStep]}
                          </p>
                        </div>
                      </div>

                      {/* Animated Step Progress Indicator */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {GENERATION_STEPS.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              idx <= generatingStep
                                ? 'bg-blue-600 dark:bg-blue-400'
                                : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Clean Human-Friendly Proposal View */}
                  {proposal && !isGenerating && (
                    <div className="space-y-4">
                      {/* Executive AI Summary Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50/60 dark:from-blue-950/30 dark:to-emerald-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-xs font-black text-gray-900 dark:text-white">
                              Optimized Schedule Action Plan
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Verified 0 Conflicts
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          Created <strong>{proposal.taskProposals.length} task proposal</strong> ({proposal.verification.totalScheduledHours}h total workload) mapped to your requested target date and time slot.
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/30">
                          <span>Total Workload: <strong className="text-gray-900 dark:text-white">{proposal.verification.totalScheduledHours}h / 7.0h</strong></span>
                          <span>•</span>
                          <span>MIT Marked: <strong className="text-amber-600 dark:text-amber-400">{proposal.taskProposals.filter(t => t.mit).length} Task</strong></span>
                        </div>
                      </div>

                      {/* Collapsible Technical Reasoning Accordion */}
                      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50/80 dark:bg-[#181d2a]/80">
                        <button
                          onClick={() => setShowReasoning(!showReasoning)}
                          className="w-full p-3 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-blue-500" />
                            Agent Reasoning Log ({proposal.steps.length} steps)
                          </span>
                          {showReasoning ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>

                        {showReasoning && (
                          <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2 bg-white dark:bg-[#121620]">
                            {proposal.steps.map((step) => (
                              <div key={step.stepNumber} className="flex items-start gap-2.5 text-[11px]">
                                <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                  {step.stepNumber}
                                </span>
                                <div>
                                  <p className="font-bold text-gray-800 dark:text-gray-200">
                                    {step.agentName}: <span className="font-normal text-gray-600 dark:text-gray-400">{step.action}</span>
                                  </p>
                                  <p className="text-[10px] text-gray-400">{step.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Proposed Schedule Slots */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          Proposed 4-Slot Schedule Breakdown
                        </h3>

                        <div className="space-y-2.5">
                          {proposal.scheduleSlots.map((slot) => (
                            <div
                              key={slot.slot}
                              className={`p-3.5 rounded-xl border transition-all ${
                                slot.tasks.length > 0
                                  ? 'bg-white dark:bg-[#181d2a] border-blue-200 dark:border-blue-900/50 shadow-sm'
                                  : 'bg-gray-50/50 dark:bg-[#141824]/50 border-gray-200/60 dark:border-gray-800/60 opacity-70'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                                  {slot.label}
                                </span>
                                <span className="text-[11px] text-gray-500 font-mono">
                                  {slot.allocatedHours}h allocated
                                </span>
                              </div>

                              {slot.tasks.length === 0 ? (
                                <p className="text-[11px] text-gray-400 pl-5 pt-1">No tasks allocated in this slot.</p>
                              ) : (
                                <div className="space-y-2 pt-2">
                                  {slot.tasks.map((t, tIdx) => (
                                    <div
                                      key={tIdx}
                                      className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-[#121620] border border-blue-100 dark:border-blue-900/30 flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        {t.mit && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white flex items-center gap-0.5 shrink-0 shadow-sm">
                                            <Flame className="w-2.5 h-2.5" />
                                            MIT
                                          </span>
                                        )}
                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                          {t.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                          {t.estimatedHours}h
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
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
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Fixed Dock Input Area (ChatGPT / Claude Style) */}
            {activeTab === 'copilot' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#161b26]/95 backdrop-blur-md space-y-3 shadow-lg">
                {/* HITL Action Controls if proposal is generated */}
                {proposal && !isGenerating && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                    <button
                      onClick={handleDiscardProposal}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Discard
                    </button>

                    <button
                      onClick={handleApproveAndSync}
                      disabled={isApproving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isApproving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing Workspace...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Sync Tasks</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Quick Prompt Suggestion Chips when prompt is empty */}
                {!prompt.trim() && !isGenerating && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setPrompt("Create a task for tomorrow afternoon to prepare for the senior hostel interview")}
                      className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/80 dark:border-blue-800/80 shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                    >
                      📅 Tomorrow Interview Prep
                    </button>
                    <button
                      onClick={() => setPrompt("Analyze my workload and generate today's optimal schedule")}
                      className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-700 shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      ⚡ Optimize Today's Workload
                    </button>
                  </div>
                )}

                {/* Floating Bottom Fixed Textarea Box */}
                <div className="relative rounded-2xl bg-gray-50 dark:bg-[#121620] border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                  <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-500" />
                      Agent Directive / Prompt
                    </span>

                    {/* AI Provider Switcher */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <Cpu className="w-3 h-3 text-gray-400" />
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AIProviderId)}
                        className="bg-transparent text-[11px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                      >
                        {availableProviders.map((p) => (
                          <option key={p.id} value={p.id} className="bg-white dark:bg-[#181d2a]">
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-2 flex items-end gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isGenerating && prompt.trim()) handleGeneratePlan();
                        }
                      }}
                      placeholder="Ask Orbit Co-Pilot to schedule a task or optimize your day..."
                      rows={2}
                      className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-medium p-1"
                    />

                    <button
                      onClick={handleGeneratePlan}
                      disabled={isGenerating || !prompt.trim()}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-1"
                      title={!prompt.trim() ? "Type a prompt or pick a suggestion chip" : "Generate Schedule"}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

