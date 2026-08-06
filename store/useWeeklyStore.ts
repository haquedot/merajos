import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WeeklyPlan } from '../types';

const DEFAULT_WEEKLY_PLAN: WeeklyPlan = {
  weekId: 'Current-Week',
  topPriorities: [],
  researchGoals: [],
  careerGoals: [],
  clientGoals: [],
  personalGoals: [],
  brainDump: '',
  nextWeekGoals: [],
  review: {
    wins: '',
    losses: '',
    improvements: '',
    score: 0,
  },
};

interface WeeklyState {
  plan: WeeklyPlan;

  updatePlan: (updates: Partial<WeeklyPlan>) => void;
  updateReview: (updates: Partial<WeeklyPlan['review']>) => void;
  resetWeekly: () => void;
}

export const useWeeklyStore = create<WeeklyState>()(
  persist(
    (set) => ({
      plan: DEFAULT_WEEKLY_PLAN,

      updatePlan: (updates) => {
        set((state) => ({ plan: { ...state.plan, ...updates } }));
      },

      updateReview: (reviewUpdates) => {
        set((state) => ({
          plan: {
            ...state.plan,
            review: { ...state.plan.review, ...reviewUpdates },
          },
        }));
      },

      resetWeekly: () => set({ plan: DEFAULT_WEEKLY_PLAN }),
    }),
    {
      name: 'meraj_os_weekly',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
