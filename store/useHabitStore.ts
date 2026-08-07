import { create } from 'zustand';
import { Habit } from '../types';

interface HabitState {
  habits: Habit[];
  
  loadFromDB: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'history'>) => Promise<void>;
  toggleHabitForDate: (habitId: string, dateStr: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  resetHabits: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => {
  // Sync with MongoDB API on load
  if (typeof window !== 'undefined') {
    fetch('/api/habits')
      .then((res) => res.json())
      .then((data) => {
        if (data.habits) {
          set({ habits: data.habits });
        }
      })
      .catch((err) => console.warn('[MongoDB HabitSync] Offline or API unreachable', err));
  }

  return {
    habits: [],

    loadFromDB: async () => {
      try {
        const res = await fetch('/api/habits');
        const data = await res.json();
        if (data.habits) {
          set({ habits: data.habits });
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

      fetch(`/api/habits?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete habit from MongoDB API', err));
    },

    resetHabits: () => set({ habits: [] }),
  };
});
