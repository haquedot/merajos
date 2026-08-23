import { Task, Goal } from '../../../types';
import { TaskScoreResult, TaskScoreFactor, UserPreferences } from '../types';

export function calculateTaskScore(
  task: Task,
  options: {
    activeGoals?: Goal[];
    currentSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
    preferences?: UserPreferences | null;
  } = {}
): TaskScoreResult {
  const factors: TaskScoreFactor[] = [];
  const { activeGoals = [], currentSlot = 'morning', preferences } = options;

  // 1. Priority Factor (Weight: 25.0)
  let priorityVal = 0.5;
  let priorityText = 'Medium priority task';
  if (task.priority === 'urgent') {
    priorityVal = 1.0;
    priorityText = 'Urgent priority task (+25.0)';
  } else if (task.priority === 'high') {
    priorityVal = 0.75;
    priorityText = 'High priority task (+18.75)';
  } else if (task.priority === 'low') {
    priorityVal = 0.25;
    priorityText = 'Low priority task (+6.25)';
  }
  const priorityScore = 25.0 * priorityVal;
  factors.push({
    name: 'Priority',
    weight: 25.0,
    value: priorityVal,
    score: priorityScore,
    explanation: priorityText,
  });

  // 2. Goal & Career Alignment Factor (Weight: 30.0)
  let goalVal = 0.2;
  let goalText = 'General task (+6.0)';
  const taskCat = (task.category || '').toLowerCase();
  const targetRole = (preferences?.targetRole || '').toLowerCase();

  const isCareerTask = taskCat === 'career' || taskCat === 'research';
  const linksToActiveGoal = activeGoals.some(
    (g) => g.id === (task as any).goalId || !g.completed
  );

  if (isCareerTask || linksToActiveGoal) {
    goalVal = 1.0;
    goalText = `Directly advances ${preferences?.targetRole || 'Career'} Goal (+30.0)`;
  }
  const goalScore = 30.0 * goalVal;
  factors.push({
    name: 'Goal Alignment',
    weight: 30.0,
    value: goalVal,
    score: goalScore,
    explanation: goalText,
  });

  // 3. Deadline Urgency Factor (Weight: 20.0)
  let urgencyVal = 0.1;
  let urgencyText = 'No immediate deadline (+2.0)';
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) {
      urgencyVal = 1.0;
      urgencyText = 'Due today or overdue (+20.0)';
    } else if (diffDays === 1) {
      urgencyVal = 0.85;
      urgencyText = 'Due tomorrow (+17.0)';
    } else if (diffDays <= 3) {
      urgencyVal = 0.6;
      urgencyText = `Due in ${diffDays} days (+12.0)`;
    } else if (diffDays <= 7) {
      urgencyVal = 0.3;
      urgencyText = 'Due this week (+6.0)';
    }
  }
  const urgencyScore = 20.0 * urgencyVal;
  factors.push({
    name: 'Deadline Urgency',
    weight: 20.0,
    value: urgencyVal,
    score: urgencyScore,
    explanation: urgencyText,
  });

  // 4. Time Slot Affinity Factor (Weight: 15.0)
  let slotVal = 0.5;
  let slotText = 'Standard slot affinity (+7.5)';
  const preferredSlot = preferences?.categorySlotAffinity?.[task.category || 'Career'];

  if (preferredSlot && preferredSlot === currentSlot) {
    slotVal = 1.0;
    slotText = `Matches preferred ${currentSlot} slot for ${task.category} (+15.0)`;
  }
  const slotScore = 15.0 * slotVal;
  factors.push({
    name: 'Slot Affinity',
    weight: 15.0,
    value: slotVal,
    score: slotScore,
    explanation: slotText,
  });

  // 5. Deferral Penalty Factor (Weight: -10.0)
  const postponeCount = (task as any).postponeCount || (task as any).deferredCount || 0;
  const deferralVal = Math.min(1.0, postponeCount * 0.25);
  const deferralScore = -10.0 * deferralVal;
  factors.push({
    name: 'Deferral Penalty',
    weight: -10.0,
    value: deferralVal,
    score: deferralScore,
    explanation: postponeCount > 0 ? `Deferred ${postponeCount} times (-${(deferralVal * 10).toFixed(1)})` : 'No deferrals',
  });

  // Calculate total score
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);

  // Confidence calculation (ranges 0.65 to 0.95 for deterministic score)
  const confidence = 0.85;

  // Apply hard constraint overrides if task is pinned as MIT or overdue today
  let hardConstraintApplied: string | undefined = undefined;
  if (task.mit) {
    hardConstraintApplied = 'User-pinned Most Important Task (MIT)';
  } else if (task.dueDate && urgencyVal === 1.0) {
    hardConstraintApplied = 'Due Today Hard Constraint';
  }

  return {
    taskId: task.id,
    totalScore: Math.max(0, Math.min(100, totalScore)),
    confidence,
    factors,
    hardConstraintApplied,
  };
}
