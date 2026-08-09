import { Task } from '../types';

export interface DailyScoreParams {
  todayTasks: Task[];
  habitsCount: number;
  completedHabitsCount: number;
  projectsCount?: number;
  goalsCount?: number;
  completedGoalsCount?: number;
  researchCount?: number;
  dsaCount?: number;
}

/**
 * Calculates the dynamic modular daily score for Orbit (0-100).
 * Implements empty-state protection: returns 0 if no activity/items exist.
 */
export function calculateDailyScore(params: DailyScoreParams): {
  dailyScore: number;
  hasRecordedItems: boolean;
  taskCompletionRate: number;
} {
  const {
    todayTasks,
    habitsCount,
    completedHabitsCount,
    projectsCount = 0,
    goalsCount = 0,
    completedGoalsCount = 0,
    researchCount = 0,
    dsaCount = 0,
  } = params;

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Empty State Protection Guard:
  // If zero tasks, habits, goals, projects, research or DSA items are scheduled/logged, return 0 (Not Started).
  const hasRecordedItems =
    totalTasks > 0 ||
    habitsCount > 0 ||
    goalsCount > 0 ||
    projectsCount > 0 ||
    researchCount > 0 ||
    dsaCount > 0;

  if (!hasRecordedItems) {
    return {
      dailyScore: 0,
      hasRecordedItems: false,
      taskCompletionRate: 0,
    };
  }

  // 1. Core Task & MIT Score (Weight: 40%)
  let taskScore = 0;
  if (totalTasks > 0) {
    const todayMits = todayTasks.filter((t) => t.mit);
    const completedTodayMits = todayMits.filter((t) => t.status === 'completed').length;
    const mitCompletionRate = todayMits.length > 0 ? (completedTodayMits / todayMits.length) * 100 : taskCompletionRate;

    // Base task rate 60% + MIT completion 40% boost
    taskScore = Math.round(taskCompletionRate * 0.6 + mitCompletionRate * 0.4);
  }

  // 2. Dynamic Modules Score (Weight: 60% evenly split across enabled active user modules)
  const activeModuleScores: number[] = [];

  if (habitsCount > 0) {
    const habitRate = Math.round((completedHabitsCount / habitsCount) * 100);
    activeModuleScores.push(habitRate);
  }

  if (goalsCount > 0) {
    const goalRate = Math.round((completedGoalsCount / goalsCount) * 100);
    activeModuleScores.push(goalRate);
  }

  if (projectsCount > 0) {
    const clientTasks = todayTasks.filter(
      (t) => (t.category as string) === 'Client Work' || (t.category as string) === 'Client'
    );
    if (clientTasks.length > 0) {
      const completedClient = clientTasks.filter((t) => t.status === 'completed').length;
      activeModuleScores.push(Math.round((completedClient / clientTasks.length) * 100));
    }
  }

  if (researchCount > 0) {
    const researchTasks = todayTasks.filter((t) => t.category === 'Research');
    if (researchTasks.length > 0) {
      const completedResearch = researchTasks.filter((t) => t.status === 'completed').length;
      activeModuleScores.push(Math.round((completedResearch / researchTasks.length) * 100));
    }
  }

  if (dsaCount > 0) {
    const careerTasks = todayTasks.filter((t) => t.category === 'Career');
    if (careerTasks.length > 0) {
      const completedCareer = careerTasks.filter((t) => t.status === 'completed').length;
      activeModuleScores.push(Math.round((completedCareer / careerTasks.length) * 100));
    }
  }

  const dynamicModulesAvg =
    activeModuleScores.length > 0
      ? activeModuleScores.reduce((a, b) => a + b, 0) / activeModuleScores.length
      : taskScore;

  const dailyScore = Math.min(100, Math.round(taskScore * 0.40 + dynamicModulesAvg * 0.60));

  return {
    dailyScore,
    hasRecordedItems: true,
    taskCompletionRate,
  };
}
