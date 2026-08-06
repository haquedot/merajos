import { create } from 'zustand';
import { CalendarEvent } from '../types';
import { db } from '../database/dexie';
import { syncService } from '../services/google/sync.service';

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

export const useCalendarStore = create<CalendarState>((set, get) => {
  if (typeof window !== 'undefined') {
    db.events.toArray().then((items) => {
      set({ events: items || [] });
    });
  }

  return {
    events: [],
    selectedDate: new Date().toISOString().split('T')[0],
    viewMode: 'week',

    loadFromDB: async () => {
      const items = await db.events.toArray();
      set({ events: items || [] });
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

      syncService.queueMutation('update', 'event', id, updatedEvent);
    },

    deleteEvent: async (id) => {
      const existing = get().events.find((e) => e.id === id);
      await db.events.delete(id);

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));

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
