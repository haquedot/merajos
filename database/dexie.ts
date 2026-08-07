import Dexie, { Table } from 'dexie';
import {
  Task,
  CalendarEvent,
  Project,
  Paper,
  JobApplication,
  Habit,
  Goal,
  Note,
  UserSettings,
  WeeklyPlan,
} from '../types';

export interface SyncQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entityType: 'task' | 'event';
  entityId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface GoogleAccountSession {
  id: string; // 'me'
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  email: string | null;
  name: string | null;
  picture: string | null;
  connectedCalendars: { id: string; summary: string; color: string }[];
  connectedTaskLists: { id: string; title: string }[];
}

export class MerajOSDatabase extends Dexie {
  tasks!: Table<Task, string>;
  events!: Table<CalendarEvent, string>;
  projects!: Table<Project, string>;
  papers!: Table<Paper, string>;
  jobs!: Table<JobApplication, string>;
  habits!: Table<Habit, string>;
  goals!: Table<Goal, string>;
  notes!: Table<Note, string>;
  settings!: Table<UserSettings, string>;
  weeklyPlans!: Table<WeeklyPlan, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  googleSession!: Table<GoogleAccountSession, string>;

  constructor() {
    super('MerajOS_IndexedDB');

    this.version(1).stores({
      tasks: 'id, googleTaskId, status, category, dueDate, mit, projectId',
      events: 'id, googleEventId, startDate, category',
      projects: 'id, status, clientName',
      papers: 'id, status, priority',
      jobs: 'id, status, company',
      habits: 'id, category',
      goals: 'id, tier, priority',
      notes: 'id, category, pinned, updatedAt',
      settings: 'id',
      weeklyPlans: 'weekId',
      syncQueue: '++id, entityType, entityId, timestamp',
      googleSession: 'id',
    });
  }
}

export const db = new MerajOSDatabase();

// Complete hard wipe of all old cached data in IndexedDB and localStorage
export async function seedDexieDatabaseIfEmpty() {
  if (typeof window !== 'undefined') {
    const PURGE_KEY = 'meraj_os_purged_v2';
    if (!localStorage.getItem(PURGE_KEY)) {
      console.log('[Dexie] Executing total data purge of old seed/cached data...');
      try {
        await Promise.all([
          db.tasks.clear(),
          db.events.clear(),
          db.projects.clear(),
          db.papers.clear(),
          db.jobs.clear(),
          db.habits.clear(),
          db.goals.clear(),
          db.notes.clear(),
          db.weeklyPlans.clear(),
          db.syncQueue.clear(),
        ]);
        
        // Clear all store Zustand localStorages
        const keysToRemove = [
          'meraj_os_projects',
          'meraj_os_career',
          'meraj_os_research',
          'meraj_os_habits',
          'meraj_os_goals',
          'meraj_os_notes',
          'meraj_os_weekly',
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(PURGE_KEY, 'true');
      } catch (err) {
        console.warn('Failed to clear old database items:', err);
      }
    }
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      theme: 'dark',
      accentColor: '#3b82f6',
      sidebarCollapsed: false,
      pomodoroTime: 25,
      soundEnabled: true,
      emailNotificationsEnabled: true,
      notificationEmail: 'merajulhaque.official@gmail.com',
    });
  }
}
