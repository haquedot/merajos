import { create } from 'zustand';
import { Habit } from '../types';
import { db } from '../database/dexie';
import { isUserAuthenticated } from '../lib/authCheck';

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  
  loadFromDB: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'history'>) => Promise<void>;
  toggleHabitForDate: (habitId: string, dateStr: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  resetHabits: () => void;
}

const mergeHabits = (local: Habit[], remote: Habit[]): Habit[] => {
  const map = new Map<string, Habit>();
  (local || []).forEach((h) => {
    if (h && h.id) map.set(h.id, h);
  });
  (remote || []).forEach((h) => {
    if (h && h.id) {
      const existing = map.get(h.id);
      map.set(h.id, { ...existing, ...h });
    }
  });
  return Array.from(map.values());
};

export const useHabitStore = create<HabitState>((set, get) => {
  // Sync with IndexedDB & MongoDB API on initialization
  if (typeof window !== 'undefined') {
    db.habits.toArray().then((localItems) => {
      if (localItems && localItems.length > 0) {
        set((state) => ({ habits: mergeHabits(state.habits, localItems), isLoading: false }));
      } else {
        set({ isLoading: false });
      }
    });

    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      fetch('/api/habits')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.habits && Array.isArray(data.habits)) {
            set((state) => {
              const merged = mergeHabits(state.habits, data.habits);
              db.habits.bulkPut(merged);
              return { habits: merged, isLoading: false };
            });
          } else {
            set({ isLoading: false });
          }
        })
        .catch((err) => {
          console.warn('[MongoDB HabitSync] Offline or API unreachable', err);
          set({ isLoading: false });
        });
    });
  }

  return {
    habits: [],
    isLoading: true,

    loadFromDB: async () => {
      // 1. Dexie IndexedDB cache load
      const localItems = await db.habits.toArray();
      if (localItems && localItems.length > 0) {
        set((state) => ({ habits: mergeHabits(state.habits, localItems) }));
      }

      // 2. MongoDB API sync (if authenticated)
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/habits');
        if (!res.ok) return;
        const data = await res.json();
        if (data.habits && Array.isArray(data.habits)) {
          set((state) => {
            const merged = mergeHabits(state.habits, data.habits);
            db.habits.bulkPut(merged);
            return { habits: merged };
          });
        }
      } catch (err) {
        console.warn('Failed to load habits from MongoDB API', err);
      }
    },

    addHabit: async (data) => {
      const id = `h-${Date.now()}`;
      const newHabit: Habit = {
        ...data,
        id,
        currentStreak: 0,
        longestStreak: 0,
        history: {},
      };

      set((state) => ({ habits: [...state.habits, newHabit] }));
      db.habits.put(newHabit).catch(() => {});

      // Save to MongoDB API
      fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
      }).catch((err) => console.warn('Failed to save habit to MongoDB API', err));
    },

    toggleHabitForDate: async (habitId, dateStr) => {
      let updatedHabit: Habit | null = null;

      set((state) => ({
        habits: state.habits.map((h) => {
          if (h.id === habitId) {
            const currentVal = !!h.history[dateStr];
            const newHistory = { ...h.history, [dateStr]: !currentVal };

            let currentStreak = 0;
            let longestStreak = h.longestStreak;
            const todayStr = new Date().toISOString().split('T')[0];
            let checkDate = new Date(todayStr);

            while (true) {
              const formatted = checkDate.toISOString().split('T')[0];
              if (newHistory[formatted]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }

            if (currentStreak > longestStreak) {
              longestStreak = currentStreak;
            }

            updatedHabit = {
              ...h,
              history: newHistory,
              currentStreak,
              longestStreak,
            };

            return updatedHabit;
          }
          return h;
        }),
      }));

      if (updatedHabit) {
        db.habits.put(updatedHabit).catch(() => {});
        fetch('/api/habits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedHabit),
        }).catch((err) => console.warn('Failed to update habit in MongoDB API', err));
      }
    },

    deleteHabit: async (id) => {
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));

      db.habits.delete(id).catch(() => {});
      fetch(`/api/habits?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete habit from MongoDB API', err));
    },

    resetHabits: () => {
      db.habits.clear().catch(() => {});
      set({ habits: [] });
    },
  };
});

