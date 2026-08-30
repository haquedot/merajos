'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { AuthRequiredModal } from '../modals/AuthRequiredModal';
import toast from 'react-hot-toast';
import { useTaskStore } from '../../store/useTaskStore';
import { db } from '../../database/dexie';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/card';
import { Sheet, SheetContent } from '../ui/sheet';
import { Checkbox } from '../ui/checkbox';
import { Select } from '../ui/select';
import {
  ChatThread,
  ChatMessage,
  getChatThreads,
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
  const { session } = useGoogleAuth();
  const [mounted, setMounted] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [availableProviders, setAvailableProviders] = useState<{ id: AIProviderId; name: string; requiresKey: boolean }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('ollama');

  const [approvedTasks, setApprovedTasks] = useState<Record<string, boolean>>({});
  const [syncedMessages, setSyncedMessages] = useState<Record<string, boolean>>({});

  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize or load threads when drawer opens
  useEffect(() => {
    if (isOpen) {
      let existing = getChatThreads();
      if (existing.length === 0) {
        const fresh = createChatThread('New Chat Session');
        existing = [fresh];
      }
      setThreads(existing);
      if (!activeThreadId || !existing.some((t) => t.id === activeThreadId)) {
        setActiveThreadId(existing[0].id);
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

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  // Scroll to bottom of message list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle new thread creation
  const handleNewChat = () => {
    const newThread = createChatThread('New Chat Session');
    const updated = getChatThreads();
    setThreads(updated);
    setActiveThreadId(newThread.id);
    setShowHistoryDropdown(false);
    toast.success('Started new chat session');
  };

  // Handle switching threads
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistoryDropdown(false);
  };

  // Handle thread deletion
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

    // Restrict AI execution to authenticated users
    if (!session) {
      setAuthModalOpen(true);
      return;
    }

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
      const recentHistory = activeThread
        ? activeThread.messages.slice(-2).map((m) => ({
            role: m.role,
            content: m.content
          }))
        : [];

      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          providerId: selectedProvider,
          chatHistory: recentHistory
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Error ${res.status}`);
      }

      const data = await res.json();
      const proposal: AgentCoPilotProposal = data.proposal;

      // Auto-approve tasks by default
      if (proposal.taskProposals && proposal.taskProposals.length > 0) {
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
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const newTasks = tasksToSync.map((tp) => ({
        id: `task_copilot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: tp.title,
        status: 'todo' as const,
        priority: tp.priority || 'medium',
        category: tp.category || 'General',
        dueDate: today,
        estimatedHours: tp.estimatedHours || 1,
        sourceModule: tp.sourceModule,
        sourceEntityId: tp.sourceEntityId,
        mit: tp.mit || false,
        createdAt: now,
        updatedAt: now
      }));

      // Add to store
      const store = useTaskStore.getState();
      for (const t of newTasks) {
        await store.addTask(t as any);
      }

      setSyncedMessages((prev) => ({ ...prev, [msgId]: true }));
      toast.success(`Successfully synced ${newTasks.length} tasks to Orbit!`);

      // Sync backend API
      const headers = await getAuthHeaders();
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-800" hideCloseButton>
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
            <Button
              size="sm"
              variant="default"
              onClick={handleNewChat}
              className="gap-1.5 font-extrabold"
              title="Start a new chat thread"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>

            {/* History Dropdown Toggle */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="gap-1.5 font-extrabold"
                title="Previous Chat Threads"
              >
                <History className="w-4 h-4 text-sky-500" />
                {threads.length > 0 && (
                  <Badge variant="info" size="sm" className="font-mono">
                    {threads.length}
                  </Badge>
                )}
              </Button>

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
                      <button
                        onClick={handleClearAllHistory}
                        className="text-[10px] text-rose-500 hover:underline font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 p-1">
                      {threads.length === 0 ? (
                        <p className="text-xs text-gray-400 p-3 text-center">No previous chats</p>
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

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </Button>
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
                    Welcome to Omini Chat
                  </h3>
                  <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed font-medium">
                    Ask any questions, request schedule recommendations, or manage your workspace modules in natural language.
                  </p>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                  {[
                    'Organize my tasks for today',
                    'Who is prime minister of India?',
                    'Create a new project "Orbit"',
                    'Give me career study recommendations'
                  ].map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(promptText)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-blue-100 font-semibold transition-all text-left truncate max-w-xs cursor-pointer active:scale-95"
                    >
                      "{promptText}"
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Render Chat Messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-1 border border-sky-500/30">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* User Bubble */}
                {msg.role === 'user' && (
                  <div className="p-3.5 rounded-2xl rounded-tr-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 leading-relaxed">
                    {msg.content}
                  </div>
                )}

                {/* Assistant Response Bubble */}
                {msg.role === 'assistant' && (
                  <Card className="p-4 rounded-2xl bg-white dark:bg-[#151a28] border-gray-200/80 dark:border-gray-800 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Omini Response
                      </span>
                      {msg.provider && (
                        <Badge variant="outline" size="sm" className="font-mono capitalize text-[10px]">
                          {msg.provider}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>

                    {/* Direct Action Proposals Execution Cards */}
                    {msg.proposal && msg.proposal.actionProposals && msg.proposal.actionProposals.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {msg.proposal.actionProposals.map((act) => (
                          <ActionProposalCard key={act.actionId} proposal={act} />
                        ))}
                      </div>
                    )}

                    {/* Structured Task Proposals & Schedule Slots */}
                    {msg.proposal && msg.proposal.taskProposals && msg.proposal.taskProposals.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-500" />
                            Proposed Task Plan ({msg.proposal.taskProposals.length})
                          </span>

                          {syncedMessages[msg.id] ? (
                            <Badge variant="success" size="sm" className="gap-1 font-bold">
                              <Check className="w-3 h-3" /> Synced to Orbit
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSyncToOrbit(msg.id, msg.proposal!)}
                              className="gap-1.5 font-extrabold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sync Approved Tasks</span>
                            </Button>
                          )}
                        </div>

                        {/* Task Checklist Items with Shadcn Checkbox */}
                        <div className="space-y-2">
                          {msg.proposal.taskProposals.map((t, idx) => {
                            const tId = t.id || `tp_${idx}`;
                            return (
                              <div
                                key={tId}
                                className="p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#121620] flex items-start gap-3 text-xs"
                              >
                                <Checkbox
                                  checked={!!approvedTasks[tId]}
                                  onCheckedChange={(checked) =>
                                    setApprovedTasks((prev) => ({
                                      ...prev,
                                      [tId]: checked
                                    }))
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <p className="font-extrabold text-gray-900 dark:text-white leading-snug truncate">
                                    {t.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                    {t.reason || 'Recommended task'}
                                  </p>
                                </div>
                                <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                                  {t.category}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>

                        {/* Schedule Slot Breakdown if available */}
                        {msg.proposal.scheduleSlots && msg.proposal.scheduleSlots.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              Time Slot Allocations
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {msg.proposal.scheduleSlots.map((slot) => (
                                <div
                                  key={slot.slot}
                                  className={`p-2.5 rounded-xl border text-xs ${
                                    slot.tasks.length > 0
                                      ? 'bg-blue-50/40 dark:bg-[#121620] border-blue-100 dark:border-blue-900/30'
                                      : 'bg-gray-50 dark:bg-[#141824] border-gray-200/50 dark:border-gray-800/50 opacity-60'
                                  }`}
                                >
                                  <p className="font-black uppercase text-[10px] text-blue-600 dark:text-blue-400">
                                    {slot.slot}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-0.5">
                                    {slot.tasks.length} tasks scheduled
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </motion.div>
          ))}

          {/* Generation Indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
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

        {/* ChatGPT-Style Bottom Input Bar with Shadcn Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#121827]/95 backdrop-blur-md space-y-2 shadow-2xl shrink-0 z-20">
          <div className="relative rounded-2xl bg-gray-50 dark:bg-[#181d2a] border border-gray-200 dark:border-gray-700/80 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
            <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800/80">
              <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-sky-500" />
                Chat Directive
              </span>

              {/* Shadcn AI Provider Switcher */}
              <div className="flex items-center gap-1.5 text-[11px] min-w-[140px]">
                <Cpu className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <Select
                  value={selectedProvider}
                  onValueChange={(val) => setSelectedProvider(val as AIProviderId)}
                  options={availableProviders.map((p) => ({
                    value: p.id,
                    label: p.name
                  }))}
                  className="w-full text-[11px]"
                />
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

              <Button
                size="icon"
                variant="default"
                onClick={handleSendMessage}
                disabled={isGenerating || !prompt.trim()}
                className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 shrink-0 mb-0.5"
                title="Send Message (Enter)"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-medium">
            <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line</span>
            <span className="font-mono">Omini v2</span>
          </div>
        </div>
      </SheetContent>

      {/* Login required modal when unauthenticated users submit AI requests */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </Sheet>
  );
};
