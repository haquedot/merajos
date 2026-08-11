import Dexie, { Table } from 'dexie';
import {
  Task,
  CalendarEvent,
  Project,
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
      tasks: 'id, googleTaskId, status, category, dueDate, mit, projectId, eventId',
      events: 'id, googleEventId, startDate, category',
      projects: 'id, status, clientName',
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
}

// Wipe all user data locally on logout
export async function clearAllUserData() {
  if (typeof window === 'undefined') return;

  try {
    await Promise.all([
      db.tasks.clear(),
      db.events.clear(),
      db.projects.clear(),
      db.jobs.clear(),
      db.habits.clear(),
      db.goals.clear(),
      db.notes.clear(),
      db.weeklyPlans.clear(),
      db.syncQueue.clear(),
      db.googleSession.clear(),
    ]);

    const keysToRemove = [
      'meraj_os_projects',
      'meraj_os_career',
      'meraj_os_research',
      'meraj_os_habits',
      'meraj_os_goals',
      'meraj_os_notes',
      'meraj_os_weekly',
      'google_access_token',
      'google_refresh_token',
      'google_token_expiry',
      'google_user_email',
      'google_user_name',
      'google_user_picture',
      'orbit_onboarding_completed',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Error clearing user data on logout:', err);
  }
}
