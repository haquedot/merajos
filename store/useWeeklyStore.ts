import { create } from 'zustand';
import { WeeklyPlan } from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';

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
  isLoading: boolean;

  loadFromDB: () => Promise<void>;
  updatePlan: (updates: Partial<WeeklyPlan>) => Promise<void>;
  updateReview: (updates: Partial<WeeklyPlan['review']>) => Promise<void>;
  resetWeekly: () => void;
}

export const useWeeklyStore = create<WeeklyState>((set, get) => {
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/weekly', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.plan) {
            set({ plan: data.plan, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.warn('[MongoDB WeeklySync] Offline or API unreachable', err);
        set({ isLoading: false });
      }
    });
  }

  return {
    plan: DEFAULT_WEEKLY_PLAN,
    isLoading: true,

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/weekly', { headers });
        if (!res.ok) return;
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

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/weekly', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlan),
        });
      } catch (err) {
        console.warn('Failed to update weekly plan in MongoDB API', err);
      }
    },

    updateReview: async (reviewUpdates) => {
      const updatedPlan = {
        ...get().plan,
        review: { ...get().plan.review, ...reviewUpdates },
      };
      set({ plan: updatedPlan });

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/weekly', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlan),
        });
      } catch (err) {
        console.warn('Failed to update review in MongoDB API', err);
      }
    },

    resetWeekly: () => set({ plan: DEFAULT_WEEKLY_PLAN }),
  };
});

