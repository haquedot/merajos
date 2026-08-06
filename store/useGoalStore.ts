import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Goal, GoalTier, Milestone } from '../types';

interface GoalState {
  goals: Goal[];
  selectedTierFilter: string;

  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  setSelectedTierFilter: (tier: string) => void;
  resetGoals: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],
      selectedTierFilter: 'all',

      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: `g-${Date.now()}`,
          completed: false,
        };
        set((state) => ({ goals: [newGoal, ...state.goals] }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      toggleMilestone: (goalId, milestoneId) => {
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

              return {
                ...g,
                milestones: updatedMilestones,
                progress: newProgress,
                completed: isCompleted,
              };
            }
            return g;
          }),
        }));
      },

      addMilestone: (goalId, title) => {
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
              return { ...g, milestones: updatedMilestones, progress: newProgress };
            }
            return g;
          }),
        }));
      },

      setSelectedTierFilter: (tier) => set({ selectedTierFilter: tier }),

      resetGoals: () => set({ goals: [] }),
    }),
    {
      name: 'meraj_os_goals',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
