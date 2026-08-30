import Research from '../../../models/Research';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class ResearchActionHandler implements ActionHandler {
  module = 'research';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      const newPaper = {
        id: `paper_${Date.now()}`,
        title: action.targetData.paperTitle || action.targetData.title || action.title,
        authors: action.targetData.authors || 'Unknown',
        year: action.targetData.year || new Date().getFullYear(),
        status: 'unread',
        isImportant: true,
        createdAt: new Date().toISOString()
      };

      return await Research.findOneAndUpdate(
        { userId, 'sections.id': action.targetData.sectionId || 'sec_1' },
        { $push: { 'sections.$.papers': newPaper } },
        { new: true }
      );
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'research'`);
  }
}
