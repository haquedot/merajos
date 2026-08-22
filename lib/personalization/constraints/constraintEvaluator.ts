import { Task } from '../../../types';
import { CurrentContext } from '../types';

export interface ConstraintResult {
  eligibleTasks: Task[];
  blockedTasks: { task: Task; reason: string }[];
}

export function evaluateTaskConstraints(
  tasks: Task[],
  context: CurrentContext | null
): ConstraintResult {
  const eligibleTasks: Task[] = [];
  const blockedTasks: { task: Task; reason: string }[] = [];

  for (const task of tasks) {
    // Skip already completed tasks
    if (task.status === 'completed') {
      continue;
    }

    // Constraint 1: Check if task has blocked dependency (if any)
    if ((task as any).isBlocked || (task as any).blockedByTaskId) {
      blockedTasks.push({
        task,
        reason: 'Task is currently blocked by a dependency.',
      });
      continue;
    }

    // Constraint 2: Check context workload capacity (if max capacity is severely exceeded)
    if (
      context &&
      context.workload.isOverloaded &&
      (task.priority === 'low' || (task as any).estimatedHours > 4)
    ) {
      blockedTasks.push({
        task,
        reason: 'Workload capacity threshold exceeded for today.',
      });
      continue;
    }

    eligibleTasks.push(task);
  }

  return { eligibleTasks, blockedTasks };
}
