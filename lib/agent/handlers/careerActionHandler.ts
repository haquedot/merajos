import Career from '../../../models/Career';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class CareerActionHandler implements ActionHandler {
  module = 'career';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString();

    if (action.opType === 'UPDATE' && action.entityId) {
      return await Career.findOneAndUpdate(
        { userId, 'dsaTopics.id': action.entityId },
        {
          $set: {
            'dsaTopics.$.lastRevised': todayStr,
            'dsaTopics.$.status': 'mastered'
          }
        },
        { new: true }
      );
    }

    return await Career.findOneAndUpdate(
      { userId },
      { $set: { updatedAt: todayStr } },
      { new: true, upsert: true }
    );
  }
}
