import { UserPreferences } from '../types';

export interface WeeklyReflectionPromptData {
  weekId: string;
  completedTasksCount: number;
  totalFocusHoursLogged: number;
  topCategoryCompleted: string;
  habitsConsistencyRate: number;
}

export function generateAIWeeklyReflectionPrompt(
  data: WeeklyReflectionPromptData,
  preferences: UserPreferences | null
): string {
  const role = preferences?.targetRole || 'Software Engineer';

  return `System Context: You are Orbit AI Productivity Coach analyzing weekly reflections for a ${role}.

Weekly Performance Data:
- Week Identifier: ${data.weekId}
- Tasks Completed: ${data.completedTasksCount}
- Pure Focus Hours Logged: ${data.totalFocusHoursLogged.toFixed(1)} hours
- Dominant Work Category: ${data.topCategoryCompleted}
- Habit Consistency Rate: ${(data.habitsConsistencyRate * 100).toFixed(0)}%

Instructions:
Generate a concise, encouraging 3-bullet productivity summary highlighting wins, momentum areas, and 1 actionable recommendation for next week.`;
}
