import Goal from '../../../models/Goal';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class GoalsActionHandler implements ActionHandler {
  module = 'goals';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      return await Goal.create({
        userId,
        title: action.targetData.title || action.title,
        targetDate: action.targetData.targetDate || new Date().toISOString(),
        keyResults: action.targetData.keyResults || []
      });
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'goals'`);
  }
}
