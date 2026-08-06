import { db, seedDexieDatabaseIfEmpty } from '../../database/dexie';
import { googleCalendarService } from './calendar.service';
import { googleTasksService } from './tasks.service';
import { authService } from './auth.service';
import { Task, CalendarEvent } from '../../types';

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error' | 'success';

type SyncListener = (state: SyncState, message?: string) => void;

class SyncService {
  private syncState: SyncState = 'idle';
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      this.init();
    }
  }

  private async init() {
    await seedDexieDatabaseIfEmpty();

    // Start auto sync every 2 minutes
    if (!this.autoSyncInterval) {
      this.autoSyncInterval = setInterval(() => {
        if (navigator.onLine) {
          this.syncAll();
        }
      }, 120000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.syncState);
    return () => this.listeners.delete(listener);
  }

  private notify(state: SyncState, message?: string) {
    this.syncState = state;
    this.listeners.forEach((l) => l(state, message));
  }

  private async handleOnline() {
    this.notify('syncing', 'Back online. Synchronizing with Google...');
    await this.processOfflineQueue();
    await this.syncAll();
  }

  private handleOffline() {
    this.notify('offline', 'Working in offline mode. Changes saved locally.');
  }

  public async syncAll(): Promise<void> {
    if (!navigator.onLine) {
      this.notify('offline', 'Offline. Changes will sync when connected.');
      return;
    }

    this.notify('syncing', 'Syncing Google Calendar & Tasks...');

    try {
      const session = await authService.getSession();
      if (!session) {
        this.notify('idle', 'Not connected to Google Account.');
        return;
      }

      // 1. Process Offline Queue first
      await this.processOfflineQueue();

      // 2. Sync Google Tasks
      const remoteTaskLists = await googleTasksService.fetchTaskLists();
      let allRemoteTasks: Task[] = [];

      if (remoteTaskLists.length > 0) {
        for (const list of remoteTaskLists) {
          const listTasks = await googleTasksService.fetchTasksForList(list.id);
          allRemoteTasks.push(...listTasks);
        }
      } else {
        // Default task list fetch
        const defaultTasks = await googleTasksService.fetchTasksForList('@default');
        allRemoteTasks.push(...defaultTasks);
      }

      if (allRemoteTasks.length > 0) {
        for (const rTask of allRemoteTasks) {
          const existing = await db.tasks.get(rTask.id);
          if (!existing) {
            await db.tasks.put(rTask);
          } else if (existing.syncStatus !== 'pending') {
            await db.tasks.put({ ...rTask, syncStatus: 'synced' });
          }
        }
      }

      // 3. Sync Google Calendar Events
      const remoteEvents = await googleCalendarService.fetchEvents('primary');
      if (remoteEvents.length > 0) {
        for (const rEvt of remoteEvents) {
          const existing = await db.events.get(rEvt.id);
          if (!existing) {
            await db.events.put(rEvt);
          } else if (existing.syncStatus !== 'pending') {
            await db.events.put({ ...rEvt, syncStatus: 'synced' });
          }
        }
      }

      // 4. Auto-generate Top 3 MITs for today if none selected
      await this.generateDailyMITs();

      this.notify('success', 'Google Calendar & Tasks synchronized!');
      setTimeout(() => this.notify('idle'), 4000);
    } catch (err: any) {
      console.error('[SyncService] Sync failed:', err);
      this.notify('error', 'Sync failed. Will retry automatically.');
    }
  }

  // Queue local mutation for offline sync
  public async queueMutation(action: 'create' | 'update' | 'delete', entityType: 'task' | 'event', entityId: string, payload: any) {
    await db.syncQueue.add({
      action,
      entityType,
      entityId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    });

    if (navigator.onLine) {
      this.processOfflineQueue();
    }
  }

  public async processOfflineQueue(): Promise<void> {
    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) return;

    console.log(`[SyncService] Processing ${queue.length} offline mutations...`);

    for (const item of queue) {
      try {
        if (item.entityType === 'task') {
          if (item.action === 'create') {
            await googleTasksService.createTask(item.payload);
          } else if (item.action === 'update') {
            await googleTasksService.updateTask(item.payload);
          } else if (item.action === 'delete') {
            await googleTasksService.deleteTask(item.entityId);
          }
        } else if (item.entityType === 'event') {
          if (item.action === 'create') {
            await googleCalendarService.createEvent(item.payload);
          } else if (item.action === 'update') {
            await googleCalendarService.updateEvent(item.payload);
          } else if (item.action === 'delete') {
            await googleCalendarService.deleteEvent(item.entityId);
          }
        }

        // Remove from queue on success
        if (item.id) {
          await db.syncQueue.delete(item.id);
        }
      } catch (err) {
        console.warn(`[SyncService] Failed to push mutation item ${item.id}:`, err);
      }
    }
  }

  // Automatic MIT Generation Logic
  public async generateDailyMITs(): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = await db.tasks.where('dueDate').equals(todayStr).toArray();

    const existingMITs = todayTasks.filter((t) => t.mit);
    if (existingMITs.length >= 3) return;

    // Pick top candidate tasks based on priority (urgent/high) or research/career deadlines
    const candidateTasks = todayTasks.filter((t) => !t.mit && t.status !== 'completed');

    candidateTasks.sort((a, b) => {
      const pScore: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pScore[b.priority] - pScore[a.priority];
    });

    const neededCount = 3 - existingMITs.length;
    const toSelect = candidateTasks.slice(0, neededCount);

    for (const t of toSelect) {
      await db.tasks.update(t.id, { mit: true });
    }
  }
}

export const syncService = new SyncService();
