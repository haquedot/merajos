import Habit from '../../../models/Habit';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class HabitsActionHandler implements ActionHandler {
  module = 'habits';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      return await Habit.create({
        userId,
        name: action.targetData.name || action.targetData.title || action.title,
        frequency: action.targetData.frequency || 'daily',
        timeSlot: action.targetData.timeSlot || 'morning',
        streak: 0
      });
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'habits'`);
  }
}
