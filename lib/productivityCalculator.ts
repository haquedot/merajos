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

export interface ScoreBreakdownItem {
  id: string;
  label: string;
  category: 'tasks' | 'habits' | 'goals' | 'projects' | 'research' | 'career';
  pointsEarned: number;
  maxPoints: number;
  details: string;
  percentage: number;
  color: string;
  itemList?: {
    id: string;
    title: string;
    isCompleted: boolean;
    isMit?: boolean;
    category?: string;
    pointsEarned: number;
    maxPoints: number;
  }[];
}

export interface DailyScoreParams {
  todayTasks: Task[];
  habitsCount: number;
  completedHabitsCount: number;
  habitsList?: { id: string; name: string; isCompleted: boolean }[];
  projectsCount?: number;
  goalsCount?: number;
  completedGoalsCount?: number;
  researchCount?: number;
  dsaCount?: number;
}

/**
 * Calculates the dynamic modular daily score for Orbit (0-100) with detailed pointer breakdown.
 * Implements empty-state protection: returns 0 if no activity/items exist.
 */
export function calculateDailyScore(params: DailyScoreParams): {
  dailyScore: number;
  hasRecordedItems: boolean;
  taskCompletionRate: number;
  breakdownItems: ScoreBreakdownItem[];
} {
  const {
    todayTasks,
    habitsCount,
    completedHabitsCount,
    habitsList,
    projectsCount = 0,
    goalsCount = 0,
    completedGoalsCount = 0,
    researchCount = 0,
    dsaCount = 0,
  } = params;

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const breakdownItems: ScoreBreakdownItem[] = [];

  // Empty State Guard
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
      breakdownItems: [],
    };
  }

  // 1. Core Task & MIT Score (Weight: 40% -> Max 40 Points)
  let taskScore = 0;
  let taskPointsEarned = 0;
  if (totalTasks > 0) {
    const todayMits = todayTasks.filter((t) => t.mit);
    const completedTodayMits = todayMits.filter((t) => t.status === 'completed').length;
    const mitCompletionRate = todayMits.length > 0 ? (completedTodayMits / todayMits.length) * 100 : taskCompletionRate;

    // Base task rate 60% + MIT completion 40% boost
    taskScore = Math.round(taskCompletionRate * 0.6 + mitCompletionRate * 0.4);
    taskPointsEarned = Math.round((taskScore / 100) * 40);

    // Calculate individual task point values out of 40 max points
    const totalTaskWeight = todayTasks.reduce((acc, t) => acc + (t.mit ? 2 : 1), 0);
    const ptsPerWeightUnit = totalTaskWeight > 0 ? 40 / totalTaskWeight : 0;

    const taskItemList = todayTasks.map((t) => {
      const isCompleted = t.status === 'completed';
      const itemMaxPoints = Math.max(1, Math.round((t.mit ? 2 : 1) * ptsPerWeightUnit));
      const itemPointsEarned = isCompleted ? itemMaxPoints : 0;

      return {
        id: t.id,
        title: t.title,
        isCompleted,
        isMit: t.mit,
        category: t.category,
        pointsEarned: itemPointsEarned,
        maxPoints: itemMaxPoints,
      };
    });

    breakdownItems.push({
      id: 'tasks_mits',
      label: 'Tasks & Key Priorities (MITs)',
      category: 'tasks',
      pointsEarned: taskPointsEarned,
      maxPoints: 40,
      details: `${completedTasks} of ${totalTasks} tasks done (${completedTodayMits}/${todayMits.length} MITs)`,
      percentage: taskScore,
      color: '#3B82F6', // Blue
      itemList: taskItemList,
    });
  }

  // 2. Dynamic Modules Score (Weight: 60% split across active modules)
  const activeModules: {
    id: string;
    label: string;
    category: 'habits' | 'goals' | 'projects' | 'research' | 'career';
    rate: number;
    details: string;
    color: string;
    itemList?: { id: string; title: string; isCompleted: boolean; isMit?: boolean; category?: string; pointsEarned: number; maxPoints: number }[];
  }[] = [];

  if (habitsCount > 0) {
    const habitRate = Math.round((completedHabitsCount / habitsCount) * 100);
    activeModules.push({
      id: 'habits',
      label: 'Daily Habits Routine',
      category: 'habits',
      rate: habitRate,
      details: `${completedHabitsCount} of ${habitsCount} daily habits maintained`,
      color: '#10B981', // Emerald
    });
  }

  if (goalsCount > 0) {
    const goalRate = Math.round((completedGoalsCount / goalsCount) * 100);
    activeModules.push({
      id: 'goals',
      label: 'Quarterly Goals Progress',
      category: 'goals',
      rate: goalRate,
      details: `${completedGoalsCount} of ${goalsCount} target goals reached`,
      color: '#8B5CF6', // Purple
    });
  }

  if (projectsCount > 0) {
    const clientTasks = todayTasks.filter(
      (t) => (t.category as string) === 'Client Work' || (t.category as string) === 'Client'
    );
    if (clientTasks.length > 0) {
      const completedClient = clientTasks.filter((t) => t.status === 'completed').length;
      const clientRate = Math.round((completedClient / clientTasks.length) * 100);
      activeModules.push({
        id: 'projects',
        label: 'Client Projects',
        category: 'projects',
        rate: clientRate,
        details: `${completedClient} of ${clientTasks.length} client tasks completed`,
        color: '#F59E0B', // Amber
      });
    }
  }

  if (researchCount > 0) {
    const researchTasks = todayTasks.filter((t) => t.category === 'Research');
    if (researchTasks.length > 0) {
      const completedResearch = researchTasks.filter((t) => t.status === 'completed').length;
      const researchRate = Math.round((completedResearch / researchTasks.length) * 100);
      activeModules.push({
        id: 'research',
        label: 'Research & Academic',
        category: 'research',
        rate: researchRate,
        details: `${completedResearch} of ${researchTasks.length} research tasks completed`,
        color: '#06B6D4', // Cyan
      });
    }
  }

  if (dsaCount > 0) {
    const careerTasks = todayTasks.filter((t) => t.category === 'Career');
    if (careerTasks.length > 0) {
      const completedCareer = careerTasks.filter((t) => t.status === 'completed').length;
      const careerRate = Math.round((completedCareer / careerTasks.length) * 100);
      activeModules.push({
        id: 'career',
        label: 'Career & DSA Practice',
        category: 'career',
        rate: careerRate,
        details: `${completedCareer} of ${careerTasks.length} career problems solved`,
        color: '#EC4899', // Pink
      });
    }
  }

  const moduleWeightMax = 60;
  const maxPointsPerModule = activeModules.length > 0 ? moduleWeightMax / activeModules.length : 0;

  activeModules.forEach((mod) => {
    const pts = Math.round((mod.rate / 100) * maxPointsPerModule);
    const modMaxPts = Math.round(maxPointsPerModule);

    let finalItemList = mod.itemList;
    if (mod.category === 'habits' && habitsList && habitsList.length > 0) {
      const habitPtsPerItem = Math.max(1, Math.round(modMaxPts / habitsList.length));
      finalItemList = habitsList.map((h) => ({
        id: h.id,
        title: h.name,
        isCompleted: h.isCompleted,
        pointsEarned: h.isCompleted ? habitPtsPerItem : 0,
        maxPoints: habitPtsPerItem,
      }));
    }

    breakdownItems.push({
      id: mod.id,
      label: mod.label,
      category: mod.category,
      pointsEarned: pts,
      maxPoints: modMaxPts,
      details: mod.details,
      percentage: mod.rate,
      color: mod.color,
      itemList: finalItemList,
    });
  });

  const dynamicModulesAvg =
    activeModules.length > 0
      ? activeModules.reduce((a, b) => a + b.rate, 0) / activeModules.length
      : taskScore;

  const dailyScore = Math.min(100, Math.round(taskScore * 0.40 + dynamicModulesAvg * 0.60));

  return {
    dailyScore,
    hasRecordedItems: true,
    taskCompletionRate,
    breakdownItems,
  };
}
