import { db, seedDexieDatabaseIfEmpty } from '../../database/dexie';
import { googleCalendarService } from './calendar.service';
import { googleTasksService } from './tasks.service';
import { authService } from './auth.service';
import { Task, CalendarEvent } from '../../types';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useTaskStore, deduplicateTasksList } from '../../store/useTaskStore';

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error' | 'success';

type SyncListener = (state: SyncState, message?: string) => void;

class SyncService {
  private syncState: SyncState = 'idle';
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: any = null;
  private isSyncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      this.init();
    }
  }

  private async init() {
    await seedDexieDatabaseIfEmpty();

    // Background auto-sync every 10 minutes
    if (!this.autoSyncInterval) {
      this.autoSyncInterval = setInterval(() => {
        if (navigator.onLine) {
          this.syncAll(false);
        }
      }, 600000);
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
    await this.syncAll(false);
  }

  private handleOffline() {
    this.notify('offline', 'Working in offline mode. Changes saved locally.');
  }

  public async syncAll(isInteractive = false): Promise<void> {
    if (this.isSyncInProgress) {
      console.log('[SyncService] Sync already in progress, skipping concurrent run.');
      return;
    }

    if (!navigator.onLine) {
      this.notify('offline', 'Offline. Changes will sync when connected.');
      return;
    }

    const session = await authService.getSession();
    if (!session) {
      this.notify('idle', 'Not connected to Google Account.');
      return;
    }

    let token = await authService.getAccessToken();

    if (!token) {
      if (isInteractive) {
        try {
          this.notify('syncing', 'Re-authenticating with Google...');
          const newSession = await authService.signIn();
          token = newSession?.accessToken || null;
          if (!token) {
            this.notify('error', 'Google session expired. Click to re-authenticate.');
            return;
          }
        } catch (e) {
          this.notify('error', 'Google re-authentication failed.');
          return;
        }
      } else {
        // Background auto-sync: token expired, pause remote sync gracefully without error banner
        console.warn('[SyncService] Background sync skipped: Google OAuth access token expired.');
        this.notify('idle', 'Local DB Synced (Google sync paused).');
        return;
      }
    }

    this.isSyncInProgress = true;
    this.notify('syncing', 'Syncing Google Calendar & Tasks...');

    try {

      // 1. Process Offline Queue first
      await this.processOfflineQueue();

      // 2. Sync Google Tasks
      const remoteTaskLists = await googleTasksService.fetchTaskLists();
      let rawRemoteTasks: Task[] = [];

      if (remoteTaskLists.length > 0) {
        for (const list of remoteTaskLists) {
          const listTasks = await googleTasksService.fetchTasksForList(list.id);
          rawRemoteTasks.push(...listTasks);
        }
      }
      
      // Fallback to default list if no tasks found
      if (rawRemoteTasks.length === 0) {
        const defaultTasks = await googleTasksService.fetchTasksForList('@default');
        rawRemoteTasks.push(...defaultTasks);
      }

      // Deduplicate rawRemoteTasks in memory by googleTaskId / id
      const uniqueRemoteMap = new Map<string, Task>();
      for (const t of rawRemoteTasks) {
        const key = t.googleTaskId || t.id;
        if (!uniqueRemoteMap.has(key)) {
          uniqueRemoteMap.set(key, t);
        }
      }
      const allRemoteTasks = Array.from(uniqueRemoteMap.values());

      if (allRemoteTasks.length > 0) {
        const allLocalTasks = await db.tasks.toArray();

        for (const rTask of allRemoteTasks) {
          // Match by id, googleTaskId, or title + dueDate
          let existing = allLocalTasks.find((t) => t.id === rTask.id);
          if (!existing && rTask.googleTaskId) {
            existing = allLocalTasks.find((t) => t.googleTaskId === rTask.googleTaskId);
          }
          if (!existing) {
            existing = allLocalTasks.find(
              (t) =>
                t.title.trim().toLowerCase() === rTask.title.trim().toLowerCase() &&
                t.dueDate === rTask.dueDate
            );
          }

          if (!existing) {
            await db.tasks.put({ ...rTask, syncStatus: 'synced' });
          } else if (existing.syncStatus !== 'pending') {
            await db.tasks.put({
              ...existing,
              ...rTask,
              id: existing.id,
              googleTaskId: rTask.googleTaskId || existing.googleTaskId,
              syncStatus: 'synced',
            });
          }
        }

        // Persist to MongoDB API in a single batch request
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: allRemoteTasks }),
          });
        } catch (err) {
          console.warn('Failed to post synced tasks batch to MongoDB API', err);
        }
      }

      // Clean up any remaining duplicate local tasks in Dexie DB
      const currentTasks = await db.tasks.toArray();
      const { duplicateIds: duplicateTaskIdsToRemove } = deduplicateTasksList(currentTasks);

      if (duplicateTaskIdsToRemove.length > 0) {
        console.log(`[SyncService] Removing ${duplicateTaskIdsToRemove.length} duplicate task records from Dexie DB.`);
        await db.tasks.bulkDelete(duplicateTaskIdsToRemove);
      }

      await useTaskStore.getState().loadFromDB();

      // 3. Sync ALL Google Calendar Events (Primary + All Secondary Calendars)
      const remoteEvents = await googleCalendarService.fetchAllCalendarsEvents();
      if (remoteEvents.length > 0) {
        for (const rEvt of remoteEvents) {
          const existing = await db.events.get(rEvt.id);
          if (!existing) {
            await db.events.put(rEvt);
          } else if (existing.syncStatus !== 'pending') {
            await db.events.put({ ...rEvt, syncStatus: 'synced' });
          }
        }

        // Persist to MongoDB API in a single batch request
        try {
          await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: remoteEvents }),
          });
        } catch (err) {
          console.warn('Failed to post synced events batch to MongoDB API', err);
        }

        await useCalendarStore.getState().loadFromDB();
      }

      // 4. Auto-generate Top 3 MITs for today if none selected
      await this.generateDailyMITs();

      this.notify('success', 'Google Calendar & Tasks synchronized!');
      setTimeout(() => this.notify('idle'), 4000);
    } catch (err: any) {
      console.error('[SyncService] Sync failed:', err);
      this.notify('error', 'Sync failed. Will retry automatically.');
    } finally {
      this.isSyncInProgress = false;
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
            const created = await googleTasksService.createTask(item.payload);
            if (created && created.googleTaskId) {
              await db.tasks.update(item.entityId, {
                googleTaskId: created.googleTaskId,
                syncStatus: 'synced',
              });
              useTaskStore.getState().loadFromDB();
            }
          } else if (item.action === 'update') {
            const localTask = await db.tasks.get(item.entityId);
            const taskToSync = localTask
              ? { ...item.payload, googleTaskId: localTask.googleTaskId || item.payload.googleTaskId }
              : item.payload;
            const ok = await googleTasksService.updateTask(taskToSync);
            if (ok) {
              await db.tasks.update(item.entityId, { syncStatus: 'synced' });
            }
          } else if (item.action === 'delete') {
            const googleId = item.payload?.googleTaskId || item.entityId;
            await googleTasksService.deleteTask(googleId);
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
