import { Task, CalendarEvent } from '../../../types';
import { CurrentContext, WorkloadCapacityModel, UserPreferences } from '../types';

export function buildCurrentContext(
  tasks: Task[],
  events: CalendarEvent[] = [],
  preferences: UserPreferences | null = null,
  activeFocusTaskId?: string
): CurrentContext {
  const now = new Date();
  const currentHour = now.getHours();

  // Determine current time slot
  let currentTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  let remainingSlotHours = 3.0;

  if (currentHour >= 6 && currentHour < 12) {
    currentTimeSlot = 'morning';
    remainingSlotHours = Math.max(0.5, 12 - currentHour);
  } else if (currentHour >= 12 && currentHour < 17) {
    currentTimeSlot = 'afternoon';
    remainingSlotHours = Math.max(0.5, 17 - currentHour);
  } else if (currentHour >= 17 && currentHour < 21) {
    currentTimeSlot = 'evening';
    remainingSlotHours = Math.max(0.5, 21 - currentHour);
  } else {
    currentTimeSlot = 'night';
    remainingSlotHours = Math.max(0.5, 24 - currentHour + 6);
  }

  // Calculate workload capacity model
  const todayStr = now.toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.mit);

  const scheduledHours = todayTasks.reduce(
    (sum, t) => sum + (t.estimatedHours || 1.0),
    0
  );
  const completedHours = todayTasks
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.actualHours || t.estimatedHours || 1.0), 0);

  const focusedWorkHours = completedHours; // Synchronized completed hours

  // Calculate occupied hours from events
  const calendarOccupancyHours = events.reduce((sum, ev) => {
    if (ev.startDate === todayStr && ev.startTime && ev.endTime) {
      const [sh, sm] = ev.startTime.split(':').map(Number);
      const [eh, em] = ev.endTime.split(':').map(Number);
      const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
      return sum + Math.max(0.5, diff);
    }
    return sum;
  }, 0);

  const sustainableCapacityHours = preferences?.dailyCapacityHours || 7.0;
  const maxOverloadThresholdHours = preferences?.dailyCapacityHours || 7.0;
  const isOverloaded = scheduledHours > maxOverloadThresholdHours;

  const workload: WorkloadCapacityModel = {
    scheduledHours,
    completedHours,
    focusedWorkHours,
    calendarOccupancyHours,
    sustainableCapacityHours,
    maxOverloadThresholdHours,
    isOverloaded,
  };

  const overdueTaskCount = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return t.dueDate < todayStr;
  }).length;

  const todayPendingTaskCount = todayTasks.filter((t) => t.status !== 'completed').length;

  return {
    currentDate: todayStr,
    currentTimeSlot,
    remainingSlotHours,
    overdueTaskCount,
    todayPendingTaskCount,
    activeFocusTaskId,
    workload,
  };
}
