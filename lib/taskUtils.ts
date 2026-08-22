/**
 * Centralized utility for task and event deduplication algorithms.
 * Ensures consistent matching across Dexie (IndexedDB) and MongoDB.
 */

export interface DeduplicatableTask {
  id?: string;
  _id?: string;
  googleTaskId?: string;
  title?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  mit?: boolean;
  timeSlot?: string;
  [key: string]: any;
}

export interface DeduplicatableEvent {
  id?: string;
  _id?: string;
  googleEventId?: string;
  title?: string;
  startDate?: string;
  [key: string]: any;
}

/**
 * Computes a standardized string key for task deduplication.
 */
export function getTaskDeduplicationKey(task: DeduplicatableTask): string {
  if (task.googleTaskId && task.googleTaskId.trim()) {
    return `g_${task.googleTaskId.trim()}`;
  }
  const cleanTitle = (task.title || '').trim().toLowerCase();
  const cleanDueDate = (task.dueDate || '').trim();
  return `t_${cleanTitle}_${cleanDueDate}`;
}

/**
 * Pure deduplication utility for lists of tasks.
 * Returns unique tasks and list of duplicate document IDs to purge.
 */
export function deduplicateTasks<T extends DeduplicatableTask>(
  tasks: T[]
): { uniqueTasks: T[]; duplicateIds: string[] } {
  const seen = new Map<string, T>();
  const uniqueTasks: T[] = [];
  const duplicateIds: string[] = [];

  for (const task of tasks) {
    const key = getTaskDeduplicationKey(task);
    const taskId = task.id || task._id;

    if (!seen.has(key)) {
      seen.set(key, task);
      uniqueTasks.push(task);
    } else {
      if (taskId) {
        duplicateIds.push(taskId);
      }
    }
  }

  return { uniqueTasks, duplicateIds };
}

/**
 * Computes a standardized string key for event deduplication.
 */
export function getEventDeduplicationKey(event: DeduplicatableEvent): string {
  if (event.googleEventId && event.googleEventId.trim()) {
    return `g_${event.googleEventId.trim()}`;
  }
  const cleanTitle = (event.title || '').trim().toLowerCase();
  const cleanStartDate = (event.startDate || '').trim();
  return `e_${cleanTitle}_${cleanStartDate}`;
}

/**
 * Pure deduplication utility for lists of calendar events.
 */
export function deduplicateEvents<T extends DeduplicatableEvent>(
  events: T[]
): { uniqueEvents: T[]; duplicateIds: string[] } {
  const seen = new Map<string, T>();
  const uniqueEvents: T[] = [];
  const duplicateIds: string[] = [];

  for (const event of events) {
    const key = getEventDeduplicationKey(event);
    const eventId = event.id || event._id;

    if (!seen.has(key)) {
      seen.set(key, event);
      uniqueEvents.push(event);
    } else {
      if (eventId) {
        duplicateIds.push(eventId);
      }
    }
  }

  return { uniqueEvents, duplicateIds };
}

/**
 * Sorts tasks chronologically and by priority/MIT.
 */
export function sortTasksChronologically<T extends DeduplicatableTask>(tasks: T[]): T[] {
  const priorityOrder: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // Uncompleted before completed
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    // MIT tasks first
    if (a.mit && !b.mit) return -1;
    if (!a.mit && b.mit) return 1;

    // Priority comparison
    const prioA = priorityOrder[a.priority || 'medium'] || 2;
    const prioB = priorityOrder[b.priority || 'medium'] || 2;
    if (prioA !== prioB) return prioB - prioA;

    return 0;
  });
}

/**
 * Selects the optimal current focus task based on MIT status and priority.
 */
export function getSmartFocusTask<T extends DeduplicatableTask>(tasks: T[]): T | null {
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  if (pendingTasks.length === 0) return null;

  // 1. Pick top MIT pending task
  const pendingMit = pendingTasks.find((t) => t.mit);
  if (pendingMit) return pendingMit;

  // 2. Fall back to highest priority pending task
  const sorted = sortTasksChronologically(pendingTasks);
  return sorted[0] || null;
}

import { TimeSlot } from '../types';

/**
 * Parses time and slot recommendation from natural language task title or description.
 */
export function parseTimeAndSlotFromText(
  text: string,
  defaultDate?: string
): { timeSlot: TimeSlot; time?: string } {
  const lower = (text || '').toLowerCase();

  // Match specific time formats (e.g., 9am, 10:30pm, 14:00)
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  let parsedTime: string | undefined = undefined;

  if (timeMatch && (timeMatch[3] || lower.includes(':'))) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] || '00';
    const ampm = timeMatch[3];

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    parsedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  if (lower.includes('morning') || lower.includes('breakfast') || (parsedTime && parseInt(parsedTime.split(':')[0], 10) < 12)) {
    return { timeSlot: 'morning', time: parsedTime };
  }
  if (lower.includes('evening') || lower.includes('dinner') || lower.includes('sunset')) {
    return { timeSlot: 'evening', time: parsedTime };
  }
  if (lower.includes('night') || lower.includes('bedtime') || (parsedTime && parseInt(parsedTime.split(':')[0], 10) >= 21)) {
    return { timeSlot: 'night', time: parsedTime };
  }
  return { timeSlot: 'afternoon', time: parsedTime };
}
