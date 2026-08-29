import { AgentCoPilotProposal, TaskProposal } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  proposal?: AgentCoPilotProposal;
  status?: 'generated' | 'approved' | 'discarded';
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface CoPilotHistoryItem {
  id: string;
  timestamp: string;
  prompt: string;
  providerUsed: string;
  status: 'approved' | 'discarded' | 'generated';
  approvedAt?: string;
  taskCount: number;
  totalHours: number;
  taskProposals: TaskProposal[];
}

const STORAGE_KEY = 'orbit_copilot_history_v1';
const THREADS_KEY = 'orbit_copilot_chat_threads_v1';

// Backwards compatibility single history functions
export function getCoPilotHistory(): CoPilotHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse Co-Pilot history:', err);
    return [];
  }
}

export function saveCoPilotHistoryItem(item: CoPilotHistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getCoPilotHistory();
    const existingIdx = history.findIndex((h) => h.id === item.id);
    if (existingIdx >= 0) {
      history[existingIdx] = item;
    } else {
      history.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (err) {
    console.error('Failed to save Co-Pilot history:', err);
  }
}

export function markHistoryApproved(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getCoPilotHistory();
    const item = history.find((h) => h.id === id);
    if (item) {
      item.status = 'approved';
      item.approvedAt = new Date().toISOString();
      saveCoPilotHistoryItem(item);
    }
  } catch (err) {
    console.error('Failed to mark history approved:', err);
  }
}

export function clearCoPilotHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear Co-Pilot history:', err);
  }
}

// Multi-turn ChatGPT style Thread Store Functions
export function getChatThreads(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse Chat Threads:', err);
    return [];
  }
}

export function saveChatThreads(threads: ChatThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save Chat Threads:', err);
  }
}

export function createChatThread(firstUserPrompt: string): ChatThread {
  const newThread: ChatThread = {
    id: `thread_${Date.now()}`,
    title: firstUserPrompt.length > 35 ? `${firstUserPrompt.substring(0, 32)}...` : firstUserPrompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  const threads = getChatThreads();
  threads.unshift(newThread);
  saveChatThreads(threads);
  return newThread;
}

export function addMessageToThread(threadId: string, message: ChatMessage): ChatThread | null {
  const threads = getChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  thread.messages.push(message);
  thread.updatedAt = new Date().toISOString();

  // If this is the first user message, set title
  if (thread.messages.length === 1 && message.role === 'user') {
    thread.title = message.content.length > 35 ? `${message.content.substring(0, 32)}...` : message.content;
  }

  saveChatThreads(threads);
  return thread;
}

export function updateMessageStatusInThread(threadId: string, messageId: string, status: 'approved' | 'discarded'): void {
  const threads = getChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  const msg = thread.messages.find((m) => m.id === messageId);
  if (msg) {
    msg.status = status;
    saveChatThreads(threads);
  }
}

export function deleteChatThread(threadId: string): void {
  const threads = getChatThreads().filter((t) => t.id !== threadId);
  saveChatThreads(threads);
}

export function clearAllThreads(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(THREADS_KEY);
  } catch (err) {
    console.error('Failed to clear Chat Threads:', err);
  }
}
