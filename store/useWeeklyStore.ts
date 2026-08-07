import { create } from 'zustand';
import { WeeklyPlan } from '../types';
import { isUserAuthenticated } from '../lib/authCheck';

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

  loadFromDB: () => Promise<void>;
  updatePlan: (updates: Partial<WeeklyPlan>) => Promise<void>;
  updateReview: (updates: Partial<WeeklyPlan['review']>) => Promise<void>;
  resetWeekly: () => void;
}

export const useWeeklyStore = create<WeeklyState>((set, get) => {
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return;
      fetch('/api/weekly')
        .then((res) => res.json())
        .then((data) => {
          if (data.plan) {
            set({ plan: data.plan });
          }
        })
        .catch((err) => console.warn('[MongoDB WeeklySync] Offline or API unreachable', err));
    });
  }

  return {
    plan: DEFAULT_WEEKLY_PLAN,

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/weekly');
        const data = await res.json();
        if (data.plan) {
          set({ plan: data.plan });
        }
      } catch (err) {
        console.warn('Failed to load weekly plan from MongoDB API', err);
      }
    },

    updatePlan: async (updates) => {
      const updatedPlan = { ...get().plan, ...updates };
      set({ plan: updatedPlan });

      fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan),
      }).catch((err) => console.warn('Failed to update weekly plan in MongoDB API', err));
    },

    updateReview: async (reviewUpdates) => {
      const updatedPlan = {
        ...get().plan,
        review: { ...get().plan.review, ...reviewUpdates },
      };
      set({ plan: updatedPlan });

      fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan),
      }).catch((err) => console.warn('Failed to update review in MongoDB API', err));
    },

    resetWeekly: () => set({ plan: DEFAULT_WEEKLY_PLAN }),
  };
});
