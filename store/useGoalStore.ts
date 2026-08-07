import { create } from 'zustand';
import { Goal, GoalTier, Milestone } from '../types';

interface GoalState {
  goals: Goal[];
  selectedTierFilter: string;

  loadFromDB: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<void>;
  setSelectedTierFilter: (tier: string) => void;
  resetGoals: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => {
  if (typeof window !== 'undefined') {
    fetch('/api/goals')
      .then((res) => res.json())
      .then((data) => {
        if (data.goals) {
          set({ goals: data.goals });
        }
      })
      .catch((err) => console.warn('[MongoDB GoalSync] Offline or API unreachable', err));
  }

  return {
    goals: [],
    selectedTierFilter: 'all',

    loadFromDB: async () => {
      try {
        const res = await fetch('/api/goals');
        const data = await res.json();
        if (data.goals) {
          set({ goals: data.goals });
        }
      } catch (err) {
        console.warn('Failed to load goals from MongoDB API', err);
      }
    },

    addGoal: async (goalData) => {
      const newGoal: Goal = {
        ...goalData,
        id: `g-${Date.now()}`,
        completed: false,
      };

      set((state) => ({ goals: [newGoal, ...state.goals] }));

      fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      }).catch((err) => console.warn('Failed to save goal to MongoDB API', err));
    },

    updateGoal: async (id, updates) => {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }));

      fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      }).catch((err) => console.warn('Failed to update goal in MongoDB API', err));
    },

    deleteGoal: async (id) => {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));

      fetch(`/api/goals?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete goal from MongoDB API', err));
    },

    toggleMilestone: async (goalId, milestoneId) => {
      let updatedGoal: Goal | null = null;

      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id === goalId) {
            const updatedMilestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            const newProgress = updatedMilestones.length > 0
              ? Math.round((completedCount / updatedMilestones.length) * 100)
              : g.progress;
            const isCompleted = newProgress === 100;

            updatedGoal = {
              ...g,
              milestones: updatedMilestones,
              progress: newProgress,
              completed: isCompleted,
            };

            return updatedGoal;
          }
          return g;
        }),
      }));

      if (updatedGoal) {
        fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedGoal),
        }).catch((err) => console.warn('Failed to update milestone in MongoDB API', err));
      }
    },

    addMilestone: async (goalId, title) => {
      let updatedGoal: Goal | null = null;
      const newMilestone: Milestone = {
        id: `m-${Date.now()}`,
        title,
        completed: false,
      };

      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id === goalId) {
            const updatedMilestones = [...g.milestones, newMilestone];
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
            updatedGoal = { ...g, milestones: updatedMilestones, progress: newProgress };
            return updatedGoal;
          }
          return g;
        }),
      }));

      if (updatedGoal) {
        fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedGoal),
        }).catch((err) => console.warn('Failed to add milestone in MongoDB API', err));
      }
    },

    setSelectedTierFilter: (tier) => set({ selectedTierFilter: tier }),

    resetGoals: () => set({ goals: [] }),
  };
});
