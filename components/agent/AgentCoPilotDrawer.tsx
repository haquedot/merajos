'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Plus,
  History,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Clock,
  Check,
  Brain,
  MessageSquare,
  Layers,
  Calendar,
  Zap,
  Cpu
} from 'lucide-react';
import { AIProviderId, ProviderFactory } from '../../lib/agent/providers/providerFactory';
import { AgentCoPilotProposal, TaskProposal } from '../../lib/agent/types';
import { GeminiNanoBanner } from './GeminiNanoBanner';
import { ActionProposalCard } from './ActionProposalCard';
import { getAuthHeaders } from '../../lib/authCheck';
import toast from 'react-hot-toast';
import { useTaskStore } from '../../store/useTaskStore';
import { db } from '../../database/dexie';
import {
  ChatThread,
  ChatMessage,
  getChatThreads,
  saveChatThreads,
  createChatThread,
  addMessageToThread,
  deleteChatThread,
  clearAllThreads
} from '../../lib/agent/historyStore';

interface AgentCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENERATION_STEPS = [
  'Ingesting workspace tasks, projects & schedule slots...',
  'Evaluating time capacity and task priority rankings...',
  'Formulating semantic classification & response details...',
  'Verifying guardrail constraints and slot allocations...'
];

export const AgentCoPilotDrawer: React.FC<AgentCoPilotDrawerProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [availableProviders, setAvailableProviders] = useState<{ id: AIProviderId; name: string; requiresKey: boolean }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('ollama');

  const [approvedTasks, setApprovedTasks] = useState<Record<string, boolean>>({});
  const [syncedMessages, setSyncedMessages] = useState<Record<string, boolean>>({});

  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load chat threads on mount
  useEffect(() => {
    if (isOpen) {
      const loaded = getChatThreads();
      setThreads(loaded);

      if (loaded.length > 0) {
        setActiveThreadId(loaded[0].id);
      } else {
        const newThread = createChatThread('New Chat Session');
        const refreshed = getChatThreads();
        setThreads(refreshed);
        setActiveThreadId(newThread.id);
      }

      // Check available providers
      const provs = ProviderFactory.getAvailableProviders();
      setAvailableProviders(provs);
      if (provs.length > 0) {
        const hasOllama = provs.some((p) => p.id === 'ollama');
        setSelectedProvider(hasOllama ? 'ollama' : provs[0].id);
      }
    }
  }, [isOpen]);

  // Active thread and messages
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // Handler to start a new chat session
  const handleNewChat = () => {
    const newThread = createChatThread('New Chat Session');
    const updated = getChatThreads();
    setThreads(updated);
    setActiveThreadId(newThread.id);
    setShowHistoryDropdown(false);
    toast.success('Started new chat session');
  };

  // Handler to switch chat session
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistoryDropdown(false);
  };

  // Handler to delete a thread
  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    deleteChatThread(threadId);
    const updated = getChatThreads();
    setThreads(updated);

    if (activeThreadId === threadId) {
      if (updated.length > 0) {
        setActiveThreadId(updated[0].id);
      } else {
        const fresh = createChatThread('New Chat Session');
        const refreshed = getChatThreads();
        setThreads(refreshed);
        setActiveThreadId(fresh.id);
      }
    }
    toast.success('Chat session deleted');
  };

  const handleClearAllHistory = () => {
    clearAllThreads();
    const fresh = createChatThread('New Chat Session');
    const refreshed = getChatThreads();
    setThreads(refreshed);
    setActiveThreadId(fresh.id);
    setShowHistoryDropdown(false);
    toast.success('Cleared all chat history');
  };

  // Step interval simulation during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGeneratingStep(0);
      interval = setInterval(() => {
        setGeneratingStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 1100);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Send message in current active thread
  const handleSendMessage = async () => {
    if (!prompt.trim() || !activeThreadId || isGenerating) return;

    const userText = prompt.trim();
    setPrompt('');

    // Append User message locally
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    addMessageToThread(activeThreadId, userMsg);
    setThreads(getChatThreads());

    setIsGenerating(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          providerId: selectedProvider
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Error ${res.status}`);
      }

      const data = await res.json();
      const proposal: AgentCoPilotProposal = data.proposal;

      // Automatically pre-select tasks for sync
      if (proposal.taskProposals) {
        const initialApproved: Record<string, boolean> = {};
        proposal.taskProposals.forEach((t) => {
          if (t.id) initialApproved[t.id] = true;
        });
        setApprovedTasks((prev) => ({ ...prev, ...initialApproved }));
      }

      // Append Assistant message
      const assistantMsg: ChatMessage = {
        id: `msg_ast_${Date.now()}`,
        role: 'assistant',
        content: proposal.summary || 'Proposal details generated.',
        proposal,
        provider: data.providerUsed || selectedProvider,
        timestamp: new Date().toISOString()
      };

      addMessageToThread(activeThreadId, assistantMsg);
      setThreads(getChatThreads());
    } catch (err: any) {
      toast.error(`Co-Pilot Error: ${err.message}`);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please check your AI provider configuration.`,
        timestamp: new Date().toISOString()
      };
      addMessageToThread(activeThreadId, errorMsg);
      setThreads(getChatThreads());
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle task sync to database
  const handleSyncToOrbit = async (msgId: string, proposal: AgentCoPilotProposal) => {
    const tasksToSync = proposal.taskProposals.filter((t): t is TaskProposal & { id: string } => Boolean(t.id && approvedTasks[t.id]));
    if (tasksToSync.length === 0) {
      toast.error('No tasks selected for sync');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/sync-tasks', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToSync })
      });

      if (!res.ok) throw new Error('Sync request failed');

      setSyncedMessages((prev) => ({ ...prev, [msgId]: true }));
      toast.success(`Successfully synced ${tasksToSync.length} tasks to Orbit!`);

      // Refetch tasks in Zustand store
      fetch('/api/tasks', { headers })
        .then((r) => r.ok && r.json())
        .then(async (d) => {
          if (d && d.tasks) {
            useTaskStore.setState({ tasks: d.tasks });
            await db.tasks.clear();
            await db.tasks.bulkPut(d.tasks);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      toast.error(`Sync error: ${err.message}`);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-md"
          />

          {/* Chat Drawer Window */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-[10000] w-full sm:w-[560px] md:w-[640px] bg-slate-50 dark:bg-[#0f172a] border-l border-gray-200 dark:border-gray-800/80 shadow-2xl flex flex-col overflow-hidden text-gray-900 dark:text-white"
          >
            {/* Header with Continuous Rotating Gradient Avatar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800/80 bg-white/80 dark:bg-[#121827]/90 backdrop-blur-md flex items-center justify-between relative shrink-0 z-20">
              <div className="flex items-center gap-3">
                {/* Rotating Conic Gradient Beam around Avatar */}
                <div className="relative p-[1.5px] rounded-full overflow-hidden group shadow-md shrink-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-90 pointer-events-none"
                  />
                  <div className="relative z-10 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    Omini
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[220px]">
                    {activeThread ? activeThread.title : 'New Chat Session'}
                  </p>
                </div>
              </div>

              {/* Header Controls: New Chat, Previous Chats Dropdown, Close */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewChat}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  title="Start a new chat thread"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </motion.button>

                {/* History Dropdown Toggle */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-extrabold border border-gray-200 dark:border-gray-700/60"
                    title="Previous Chat Threads"
                  >
                    <History className="w-4 h-4 text-sky-500" />
                    {threads.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 text-[10px] font-mono">
                        {threads.length}
                      </span>
                    )}
                  </motion.button>

                  {/* Previous Chats Popover Dropdown */}
                  <AnimatePresence>
                    {showHistoryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 space-y-1 backdrop-blur-xl"
                      >
                        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
                          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                            Previous Chats
                          </span>
                          {threads.length > 0 && (
                            <button
                              onClick={handleClearAllHistory}
                              className="text-[10px] font-extrabold text-rose-500 hover:underline"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-1 p-0.5">
                          {threads.length === 0 ? (
                            <p className="p-4 text-center text-xs text-gray-400">No previous chat sessions</p>
                          ) : (
                            threads.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => handleSelectThread(t.id)}
                                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                                  t.id === activeThreadId
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <p className="truncate text-xs font-extrabold">{t.title}</p>
                                  <p className="text-[10px] font-mono text-gray-400">
                                    {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.messages.length} msgs
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteThread(e, t.id)}
                                  className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
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
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversational Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              <GeminiNanoBanner />

              {/* Welcome Screen with Rotating Gradient Border Beam */}
              {messages.length === 0 && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-3xl p-[1.5px] overflow-hidden shadow-xl group my-4"
                >
                  {/* Continuous Rotating Conic Gradient Beam */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />

                  {/* Inner Banner Content */}
                  <div className="relative z-10 p-6 sm:p-8 rounded-[calc(1.5rem-1.5px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Sparkles className="w-7 h-7 animate-pulse text-amber-300" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        Welcome to Omini Chat 👋
                      </h3>
                      <p className="text-xs text-blue-100/90 max-w-md mx-auto leading-relaxed">
                        Your multi-turn AI assistant for Orbit OS. Ask questions, request schedule recommendations, or manage workspace modules in natural language.
                      </p>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrompt("What should I do tomorrow?")}
                        className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-sm transition-all cursor-pointer"
                      >
                        💡 What should I do tomorrow?
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrompt("Create a new project \"Orbit\"")}
                        className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-sm transition-all cursor-pointer"
                      >
                        🚀 Create a new project "Orbit"
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrompt("Analyze todays tasks and workload")}
                        className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-sm transition-all cursor-pointer"
                      >
                        ⚡ Analyze today's tasks
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chat Messages Stream */}
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* User Bubble */}
                  {msg.role === 'user' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex justify-end pl-10"
                    >
                      <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium leading-relaxed shadow-md shadow-blue-500/20 max-w-lg">
                        {msg.content}
                      </div>
                    </motion.div>
                  ) : (
                    /* Assistant Omini Bubble */
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex items-start gap-3 pr-4"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-1 border border-sky-500/30">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Summary & Reasoning Box */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#181d2a] border border-gray-200 dark:border-gray-800 shadow-md space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Omini Response
                            </span>
                            {msg.provider && (
                              <span className="text-[10px] font-mono text-gray-400 capitalize">
                                Provider: {msg.provider}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {msg.content}
                          </p>

                          {/* Reasoning Steps if present */}
                          {msg.proposal?.steps && msg.proposal.steps.length > 0 && (
                            <details className="text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/80 pt-2 cursor-pointer group">
                              <summary className="font-bold flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                View AI Agent Reasoning Logs ({msg.proposal.steps.length} steps)
                              </summary>
                              <div className="mt-2 space-y-1.5 font-mono text-[10px] bg-gray-50 dark:bg-[#121620] p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                {msg.proposal.steps.map((step) => (
                                  <div key={step.stepNumber} className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">#{step.stepNumber}</span>
                                    <div>
                                      <span className="font-bold text-gray-700 dark:text-gray-300">[{step.agentName}]</span>{' '}
                                      <span className="text-gray-500 dark:text-gray-400">{step.action}:</span>{' '}
                                      <span className="text-gray-400 dark:text-gray-500">{step.details}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>

                        {/* Action Proposal Cards if module action */}
                        {msg.proposal?.actionProposals && msg.proposal.actionProposals.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-sky-500" />
                              Module Action Proposal
                            </span>
                            {msg.proposal.actionProposals.map((act) => (
                              <ActionProposalCard key={act.actionId} proposal={act} />
                            ))}
                          </div>
                        )}

                        {/* Schedule Slot Breakdown if present */}
                        {msg.proposal?.scheduleSlots && msg.proposal.scheduleSlots.some((s) => s.tasks.length > 0) && (
                          <div className="space-y-2.5">
                            <span className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              Proposed Schedule Breakdown
                            </span>

                            <div className="grid grid-cols-1 gap-2">
                              {msg.proposal.scheduleSlots.map((slot) => (
                                <div
                                  key={slot.slot}
                                  className={`p-3 rounded-2xl border text-xs ${
                                    slot.tasks.length > 0
                                      ? 'bg-white dark:bg-[#181d2a] border-blue-200 dark:border-blue-900/40 shadow-sm'
                                      : 'bg-gray-50 dark:bg-[#121620] border-gray-200/50 dark:border-gray-800/50 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-200">
                                    <span className="flex items-center gap-1.5 text-[11px]">
                                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                                      {slot.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-400">
                                      {slot.allocatedHours}h / {slot.availableCapacityHours}h capacity
                                    </span>
                                  </div>

                                  {slot.tasks.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                      {slot.tasks.map((task) => (
                                        <div
                                          key={task.id || task.title}
                                          className="p-2 rounded-xl bg-gray-50 dark:bg-[#121620] border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2"
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <input
                                              type="checkbox"
                                              checked={Boolean(task.id && approvedTasks[task.id])}
                                              onChange={(e) => {
                                                if (task.id) {
                                                  setApprovedTasks((prev) => ({
                                                    ...prev,
                                                    [task.id!]: e.target.checked
                                                  }));
                                                }
                                              }}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                              {task.title}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                              {task.category}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400">
                                              {task.estimatedHours}h
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* HITL Sync Button */}
                            {!syncedMessages[msg.id] ? (
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => msg.proposal && handleSyncToOrbit(msg.id, msg.proposal)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                Approve & Sync Schedule to Orbit Today
                              </motion.button>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4" />
                                Schedule Synced with Orbit Workspace!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Animated Live Thinking Indicator with Rotating Conic Gradient Beam */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 pr-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-1 border border-sky-500/30">
                    <Brain className="w-4 h-4 animate-pulse text-sky-400" />
                  </div>

                  <div className="relative rounded-2xl p-[1.5px] overflow-hidden shadow-lg flex-1">
                    {/* Continuous Rotating Conic Gradient Beam */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-90 pointer-events-none"
                    />

                    <div className="relative z-10 p-4 rounded-[calc(1rem-1.5px)] bg-slate-900 text-white space-y-2.5">
                      <p className="text-xs font-black text-sky-300 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        Omini is reasoning...
                      </p>
                      <p className="text-[11px] font-semibold text-slate-300">
                        {GENERATION_STEPS[generatingStep]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ChatGPT-Style Bottom Input Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#121827]/95 backdrop-blur-md space-y-2 shadow-2xl shrink-0 z-20">
              <div className="relative rounded-2xl bg-gray-50 dark:bg-[#181d2a] border border-gray-200 dark:border-gray-700/80 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800/80">
                  <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-sky-500" />
                    Chat Directive
                  </span>

                  {/* AI Provider Switcher */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as AIProviderId)}
                      className="bg-transparent text-[11px] font-extrabold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                    >
                      {availableProviders.map((p) => (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-[#181d2a]">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 flex items-end gap-2">
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
                    className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-medium p-1 leading-relaxed"
                  />

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSendMessage}
                    disabled={isGenerating || !prompt.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
                    title="Send Message (Enter)"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-medium">
                <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line</span>
                <span className="font-mono">Omini v2</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
