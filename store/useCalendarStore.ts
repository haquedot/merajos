import { create } from 'zustand';
import { CalendarEvent } from '../types';
import { db } from '../database/dexie';
import { syncService } from '../services/google/sync.service';
import { isUserAuthenticated } from '../lib/authCheck';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string;
  viewMode: 'day' | 'week' | 'month' | 'agenda';

  loadFromDB: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'day' | 'week' | 'month' | 'agenda') => void;

  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<string>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  resetCalendar: () => Promise<void>;
}

const mergeEvents = (local: CalendarEvent[], remote: CalendarEvent[]): CalendarEvent[] => {
  const map = new Map<string, CalendarEvent>();
  (local || []).forEach((e) => {
    if (e && e.id) map.set(e.id, e);
  });
  (remote || []).forEach((e) => {
    if (e && e.id) {
      const existing = map.get(e.id);
      map.set(e.id, { ...existing, ...e });
    }
  });
  return Array.from(map.values());
};

export const useCalendarStore = create<CalendarState>((set, get) => {
  if (typeof window !== 'undefined') {
    db.events.toArray().then((items) => {
      if (items && items.length > 0) {
        set((state) => ({ events: mergeEvents(state.events, items) }));
      }
    });

    // Fetch from MongoDB API
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return;
      fetch('/api/events')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.events && Array.isArray(data.events)) {
            set((state) => {
              const merged = mergeEvents(state.events, data.events);
              db.events.bulkPut(merged);
              return { events: merged };
            });
          }
        })
        .catch((err) => console.warn('[MongoDB EventSync] Offline or API unreachable', err));
    });
  }

  return {
    events: [],
    selectedDate: new Date().toISOString().split('T')[0],
    viewMode: 'week',

    loadFromDB: async () => {
      const localItems = await db.events.toArray();
      if (localItems && localItems.length > 0) {
        set((state) => ({ events: mergeEvents(state.events, localItems) }));
      }

      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;

      try {
        const res = await fetch('/api/events');
        if (!res.ok) return;
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          set((state) => {
            const merged = mergeEvents(state.events, data.events);
            db.events.bulkPut(merged);
            return { events: merged };
          });

          // Sync any local-only items to MongoDB
          if (localItems && localItems.length > 0) {
            const remoteIds = new Set(data.events.map((e: any) => e.id));
            for (const item of localItems) {
              if (!remoteIds.has(item.id)) {
                fetch('/api/events', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item),
                }).catch(() => {});
              }
            }
          }
        }
      } catch (err) {
        console.warn('MongoDB events fetch failed, falling back to local storage', err);
      }
    },

    setSelectedDate: (date) => set({ selectedDate: date }),
    setViewMode: (mode) => set({ viewMode: mode }),

    addEvent: async (eventData) => {
      const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newEvent: CalendarEvent = {
        ...eventData,
        id,
        syncStatus: 'pending',
        lastSyncedAt: new Date().toISOString(),
      };

      await db.events.add(newEvent);
      set((state) => ({ events: [newEvent, ...state.events] }));

      // Save to MongoDB API
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      }).catch((err) => console.warn('Failed to post event to MongoDB API', err));

      syncService.queueMutation('create', 'event', id, newEvent);
      return id;
    },

    updateEvent: async (id, updates) => {
      const existing = get().events.find((e) => e.id === id);
      if (!existing) return;

      const updatedEvent = { ...existing, ...updates, syncStatus: 'pending' as const };
      await db.events.update(id, updatedEvent);

      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
      }));

      // Update in MongoDB API
      fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      }).catch((err) => console.warn('Failed to update event in MongoDB API', err));

      syncService.queueMutation('update', 'event', id, updatedEvent);
    },

    deleteEvent: async (id) => {
      const existing = get().events.find((e) => e.id === id);
      await db.events.delete(id);

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));

      // Delete from MongoDB API
      fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete event from MongoDB API', err));

      if (existing) {
        syncService.queueMutation('delete', 'event', id, existing);
      }
    },

    resetCalendar: async () => {
      await db.events.clear();
      set({ events: [] });
    },
  };
});
