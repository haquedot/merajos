import { AgentActionProposal } from '../types';

export function createGoalProposal(params: {
  title: string;
  targetDate?: string;
  keyResults?: string[];
}): AgentActionProposal {
  const { title, targetDate, keyResults = [] } = params;
  return {
    actionId: `act_goal_create_${Date.now()}`,
    module: 'goals',
    opType: 'CREATE',
    title: `Create Goal: "${title}"`,
    description: `Set quarterly OKR goal with ${keyResults.length} Key Results`,
    targetData: { title, targetDate, keyResults },
    diffPreview: [
      { field: 'Goal Title', before: 'None', after: title },
      { field: 'Target Date', before: 'None', after: targetDate || 'End of Quarter' },
      { field: 'Key Results', before: '0 items', after: `${keyResults.length} items` }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function updateKeyResultProgressProposal(params: {
  goalId: string;
  goalTitle: string;
  krId: string;
  krTitle: string;
  currentValue: number;
  newValue: number;
}): AgentActionProposal {
  const { goalId, goalTitle, krId, krTitle, currentValue, newValue } = params;
  return {
    actionId: `act_goal_kr_${Date.now()}`,
    module: 'goals',
    opType: 'UPDATE',
    entityId: goalId,
    title: `Goal '${goalTitle}': Update Key Result`,
    description: `Log progress for Key Result '${krTitle}'`,
    targetData: { goalId, krId, newValue },
    diffPreview: [
      { field: `KR: ${krTitle}`, before: `${currentValue}%`, after: `${newValue}%` }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}
