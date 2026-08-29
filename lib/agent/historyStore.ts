import { TaskProposal } from './types';

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
    // Cap history to latest 30 runs
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
