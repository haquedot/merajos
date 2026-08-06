import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit } from '../types';

interface HabitState {
  habits: Habit[];
  
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'history'>) => void;
  toggleHabitForDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (habitId: string) => void;
  resetHabits: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],

      addHabit: (data) => {
        const newHabit: Habit = {
          ...data,
          id: `h-${Date.now()}`,
          currentStreak: 0,
          longestStreak: 0,
          history: {},
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      toggleHabitForDate: (habitId, dateStr) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === habitId) {
              const currentVal = !!h.history[dateStr];
              const newHistory = { ...h.history, [dateStr]: !currentVal };

              // Recalculate streak
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

              return {
                ...h,
                history: newHistory,
                currentStreak,
                longestStreak,
              };
            }
            return h;
          }),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      resetHabits: () => set({ habits: [] }),
    }),
    {
      name: 'meraj_os_habits',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
