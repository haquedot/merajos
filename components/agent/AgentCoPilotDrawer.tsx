'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Cpu,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Flame,
  History,
  Trash2,
  Check,
  Brain,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  User,
  Send,
  CornerDownLeft
} from 'lucide-react';
import { AgentCoPilotProposal, TaskProposal } from '../../lib/agent/types';
import { AIProviderId, DEFAULT_AI_PROVIDER } from '../../lib/agent/providers/providerFactory';
import { useTaskStore } from '../../store/useTaskStore';
import { getAuthHeaders } from '../../lib/authCheck';
import {
  ChatThread,
  ChatMessage,
  getChatThreads,
  createChatThread,
  addMessageToThread,
  updateMessageStatusInThread,
  deleteChatThread,
  clearAllThreads
} from '../../lib/agent/historyStore';
import { ActionProposalCard } from './ActionProposalCard';
import { GeminiNanoBanner } from './GeminiNanoBanner';
import toast from 'react-hot-toast';

interface AgentCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENERATION_STEPS = [
  'Ingesting user intent & workload context...',
  'Orchestrating sub-agents (Career, Research, Tasks)...',
  'Evaluating 0-overlap calendar constraints...',
  'Formatting response & task proposals...'
];

export const AgentCoPilotDrawer: React.FC<AgentCoPilotDrawerProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(DEFAULT_AI_PROVIDER);
  const [availableProviders, setAvailableProviders] = useState<{ id: AIProviderId; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [isApprovingId, setIsApprovingId] = useState<string | null>(null);
  const [expandedReasoningMsgId, setExpandedReasoningMsgId] = useState<string | null>(null);

  // Chat Threads State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const messages = activeThread ? activeThread.messages : [];

  useEffect(() => {
    setMounted(true);
    const storedThreads = getChatThreads();
    setThreads(storedThreads);
    if (storedThreads.length > 0) {
      setActiveThreadId(storedThreads[0].id);
    }

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isGenerating]);

  const handleNewChat = () => {
    setActiveThreadId(null);
    setPrompt('');
    setShowHistoryDropdown(false);
    toast.success('Started a new chat session');
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistoryDropdown(false);
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    deleteChatThread(threadId);
    const updated = getChatThreads();
    setThreads(updated);
    if (activeThreadId === threadId) {
      setActiveThreadId(updated.length > 0 ? updated[0].id : null);
    }
    toast.success('Chat deleted');
  };

  const handleClearAllHistory = () => {
    clearAllThreads();
    setThreads([]);
    setActiveThreadId(null);
    setShowHistoryDropdown(false);
    toast.success('Cleared all chat history');
  };

  const handleSendMessage = async () => {
    const userText = prompt.trim();
    if (!userText || isGenerating) return;

    // Ensure we have an active thread
    let currentThreadId = activeThreadId;
    if (!currentThreadId) {
      const newThread = createChatThread(userText);
      currentThreadId = newThread.id;
      setActiveThreadId(currentThreadId);
      setThreads(getChatThreads());
    }

    // Append User Message
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    addMessageToThread(currentThreadId, userMsg);
    setThreads(getChatThreads());
    setPrompt('');
    setIsGenerating(true);
    setGeneratingStep(0);

    const stepInterval = setInterval(() => {
      setGeneratingStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: userText,
          providerId: selectedProvider
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const proposal: AgentCoPilotProposal = data.proposal;

      // Append Assistant Message
      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: proposal.summary || 'Generated schedule recommendation',
        timestamp: new Date().toISOString(),
        provider: selectedProvider,
        proposal,
        status: 'generated'
      };

      addMessageToThread(currentThreadId, assistantMsg);
      setThreads(getChatThreads());
    } catch (err: any) {
      toast.error(`Co-Pilot Error: ${err.message}`);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const handleApproveAndSync = async (msg: ChatMessage) => {
    if (!msg.proposal || !activeThreadId) return;
    setIsApprovingId(msg.id);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrowObj = new Date();
      tomorrowObj.setDate(tomorrowObj.getDate() + 1);
      const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
      const isTomorrowPrompt = msg.proposal.userIntent.toLowerCase().includes('tomorrow');

      for (const tp of msg.proposal.taskProposals) {
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

      updateMessageStatusInThread(activeThreadId, msg.id, 'approved');
      setThreads(getChatThreads());

      toast.success(`Approved & synced ${msg.proposal.taskProposals.length} tasks!`);
    } catch (err: any) {
      toast.error(`Approval Error: ${err.message}`);
    } finally {
      setIsApprovingId(null);
    }
  };

  const handleDiscardMessage = (msgId: string) => {
    if (!activeThreadId) return;
    updateMessageStatusInThread(activeThreadId, msgId, 'discarded');
    setThreads(getChatThreads());
    toast('Proposal discarded', { icon: '🗑️' });
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

          {/* Chat Drawer Window */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[10000] w-full sm:w-[560px] md:w-[640px] bg-white dark:bg-[#121620] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ChatGPT-Style Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    Omini
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                      ChatGPT Mode
                    </span>
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[240px]">
                    {activeThread ? activeThread.title : 'New Chat Session'}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: New Chat, Previous Chats Dropdown, Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  title="Start a new chat thread"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>

                {/* History Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Previous Chat Threads"
                  >
                    <History className="w-4 h-4 text-blue-500" />
                    {threads.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px]">
                        {threads.length}
                      </span>
                    )}
                  </button>

                  {/* Previous Chats Popover Dropdown */}
                  <AnimatePresence>
                    {showHistoryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-11 z-50 w-72 bg-white dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 space-y-1"
                      >
                        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                            Previous Chats
                          </span>
                          {threads.length > 0 && (
                            <button
                              onClick={handleClearAllHistory}
                              className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-0.5">
                          {threads.length === 0 ? (
                            <p className="p-4 text-center text-xs text-gray-400">No previous chat sessions</p>
                          ) : (
                            threads.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => handleSelectThread(t.id)}
                                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${t.id === activeThreadId
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                                  }`}
                              >
                                <div className="truncate pr-2">
                                  <p className="truncate text-xs">{t.title}</p>
                                  <p className="text-[10px] font-mono text-gray-400">
                                    {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.messages.length} msgs
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteThread(e, t.id)}
                                  className="p-1 rounded text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversational Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              <GeminiNanoBanner />

              {/* Welcome Screen if thread has no messages */}
              {messages.length === 0 && !isGenerating && (
                <div className="p-8 text-center rounded-2xl bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-dashed border-blue-200 dark:border-blue-900/50 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Welcome to Omini Chat
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Ask any questions, request schedule recommendations, or manage your workspace modules in natural language.
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setPrompt("What should I do tomorrow?");
                      }}
                      className="px-3 py-1.5 rounded-full bg-white dark:bg-[#181d2a] text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800/80 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all cursor-pointer"
                    >
                      💡 What should I do tomorrow?
                    </button>
                    <button
                      onClick={() => {
                        setPrompt("Create a task for tomorrow evening to play badminton");
                      }}
                      className="px-3 py-1.5 rounded-full bg-white dark:bg-[#181d2a] text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      🏸 Create badminton task for evening
                    </button>
                    <button
                      onClick={() => {
                        setPrompt("Analyze todays tasks and workload");
                      }}
                      className="px-3 py-1.5 rounded-full bg-white dark:bg-[#181d2a] text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      ⚡ Analyze today's tasks
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages Stream */}
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* User Bubble */}
                  {msg.role === 'user' && (
                    <div className="flex items-start justify-end gap-2.5 pl-8">
                      <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-md text-xs font-medium leading-relaxed max-w-[85%]">
                        {msg.content}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Assistant Omini Bubble */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-start gap-2.5 pr-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-1">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-3.5">
                        {/* Main Response Summary Card */}
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Omini Response
                            </span>
                            {msg.provider && (
                              <span className="text-[10px] font-mono text-gray-400 capitalize">
                                {msg.provider}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {msg.content}
                          </p>

                          {/* Reasoning Log Accordion */}
                          {msg.proposal && msg.proposal.steps && msg.proposal.steps.length > 0 && (
                            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
                              <button
                                onClick={() =>
                                  setExpandedReasoningMsgId(
                                    expandedReasoningMsgId === msg.id ? null : msg.id
                                  )
                                }
                                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                              >
                                <Brain className="w-3.5 h-3.5 text-blue-500" />
                                <span>Agent Reasoning Log ({msg.proposal.steps.length} steps)</span>
                                {expandedReasoningMsgId === msg.id ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {expandedReasoningMsgId === msg.id && (
                                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-[#121620] border border-gray-200 dark:border-gray-800 space-y-1.5">
                                  {msg.proposal.steps.map((step) => (
                                    <div key={step.stepNumber} className="flex items-start gap-2 text-[10px]">
                                      <span className="w-3.5 h-3.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-[8px] flex items-center justify-center shrink-0 mt-0.5">
                                        {step.stepNumber}
                                      </span>
                                      <div>
                                        <p className="font-bold text-gray-700 dark:text-gray-300">
                                          {step.agentName}: <span className="font-normal text-gray-500">{step.action}</span>
                                        </p>
                                        <p className="text-[9px] text-gray-400">{step.details}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Omni-Module Action Proposals Card */}
                        {msg.proposal?.actionProposals && msg.proposal.actionProposals.length > 0 && (
                          <div className="space-y-2">
                            {msg.proposal.actionProposals.map((act) => (
                              <ActionProposalCard key={act.actionId} proposal={act} />
                            ))}
                          </div>
                        )}

                        {/* 4-Slot Schedule Breakdown Card (Only if task proposals exist and not analysis only) */}
                        {msg.proposal && !msg.proposal.isAnalysisOnly && msg.proposal.scheduleSlots && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181d2a] border border-blue-200 dark:border-blue-900/50 space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                Proposed Schedule Breakdown
                              </h4>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified {msg.proposal.verification.totalScheduledHours}h Workload
                              </span>
                            </div>

                            <div className="space-y-2">
                              {msg.proposal.scheduleSlots.map((slot) => (
                                <div
                                  key={slot.slot}
                                  className={`p-2.5 rounded-xl border text-xs ${slot.tasks.length > 0
                                      ? 'bg-blue-50/40 dark:bg-[#121620] border-blue-100 dark:border-blue-900/30'
                                      : 'bg-gray-50 dark:bg-[#141824] border-gray-200/50 dark:border-gray-800/50 opacity-60'
                                    }`}
                                >
                                  <div className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-200">
                                    <span className="flex items-center gap-1 text-[11px]">
                                      <Clock className="w-3 h-3 text-blue-500" />
                                      {slot.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-400">
                                      {slot.allocatedHours}h
                                    </span>
                                  </div>

                                  {slot.tasks.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between pt-1 text-[11px]">
                                      <span className="truncate flex items-center gap-1.5">
                                        {t.mit && <Flame className="w-3 h-3 text-amber-500 shrink-0" />}
                                        {t.title}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                                        {t.estimatedHours}h
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message HITL Action Footer Controls */}
                        {msg.proposal && (
                          <div className="flex items-center gap-2 pt-1">
                            {msg.status === 'approved' ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Synced & Approved
                              </span>
                            ) : msg.status === 'discarded' ? (
                              <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold">
                                Discarded
                              </span>
                            ) : msg.proposal.isAnalysisOnly ? (
                              <button
                                onClick={() => handleDiscardMessage(msg.id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Acknowledge Analysis
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApproveAndSync(msg)}
                                  disabled={isApprovingId === msg.id}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isApprovingId === msg.id ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Syncing Tasks...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve & Sync Tasks</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDiscardMessage(msg.id)}
                                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Discard
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Animated Live Thinking Indicator while Generating */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 pr-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-1">
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-2.5 shadow-md flex-1">
                    <p className="text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      Omini is generating response...
                    </p>
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                      {GENERATION_STEPS[generatingStep]}
                    </p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ChatGPT-Style Bottom Input Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#161b26]/95 backdrop-blur-md space-y-2 shadow-lg shrink-0">
              <div className="relative rounded-2xl bg-gray-50 dark:bg-[#121620] border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-500" />
                    Chat Directive
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
                        if (!isGenerating && prompt.trim()) handleSendMessage();
                      }
                    }}
                    placeholder="Ask Omini a question or request schedule actions..."
                    rows={2}
                    className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-medium p-1"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={isGenerating || !prompt.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-1"
                    title="Send Message (Enter)"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
                <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line</span>
                <span>Omini v2</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
