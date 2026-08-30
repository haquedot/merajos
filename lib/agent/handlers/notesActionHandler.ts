import Note from '../../../models/Note';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class NotesActionHandler implements ActionHandler {
  module = 'notes';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      return await Note.create({
        userId,
        title: action.targetData.title || action.title,
        content: action.targetData.content || '',
        tags: action.targetData.tags || ['co-pilot'],
        folder: action.targetData.folder || 'General',
        pinned: false
      });
    }

    if (action.opType === 'UPDATE' && action.entityId) {
      return await Note.findOneAndUpdate(
        { _id: action.entityId, userId },
        { $set: action.targetData.updates || action.targetData },
        { new: true }
      );
    }

    if (action.opType === 'DELETE' && action.entityId) {
      return await Note.findOneAndDelete({ _id: action.entityId, userId });
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'notes'`);
  }
}
