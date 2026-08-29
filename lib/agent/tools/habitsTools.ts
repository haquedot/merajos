import { AgentActionProposal } from '../types';

export function createHabitProposal(params: {
  name: string;
  frequency?: string;
  timeSlot?: string;
}): AgentActionProposal {
  const { name, frequency = 'daily', timeSlot = 'morning' } = params;
  return {
    actionId: `act_habit_create_${Date.now()}`,
    module: 'habits',
    opType: 'CREATE',
    title: `Create Habit: "${name}"`,
    description: `Track new ${frequency} habit allocated to ${timeSlot} slot`,
    targetData: { name, frequency, timeSlot },
    diffPreview: [
      { field: 'Habit Name', before: 'None', after: name },
      { field: 'Frequency', before: 'None', after: frequency },
      { field: 'Time Slot', before: 'None', after: timeSlot }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function completeHabitProposal(params: {
  habitId: string;
  habitName: string;
  currentStreak?: number;
}): AgentActionProposal {
  const { habitId, habitName, currentStreak = 0 } = params;
  return {
    actionId: `act_habit_complete_${Date.now()}`,
    module: 'habits',
    opType: 'UPDATE',
    entityId: habitId,
    title: `Log Habit Completed: "${habitName}"`,
    description: `Mark today's routine completed and increment streak`,
    targetData: { habitId, completedDate: new Date().toISOString().split('T')[0] },
    diffPreview: [
      { field: 'Completed Today', before: 'No', after: 'Yes' },
      { field: 'Streak', before: `${currentStreak} days`, after: `${currentStreak + 1} days` }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function archiveHabitProposal(params: {
  habitId: string;
  habitName: string;
}): AgentActionProposal {
  const { habitId, habitName } = params;
  return {
    actionId: `act_habit_archive_${Date.now()}`,
    module: 'habits',
    opType: 'DELETE',
    entityId: habitId,
    title: `Archive Habit: "${habitName}"`,
    description: `Archive habit routine '${habitName}'`,
    targetData: { habitId },
    diffPreview: [
      { field: 'Status', before: 'Active', after: 'Archived' }
    ],
    requiresConfirmation: true,
    status: 'pending'
  };
}
