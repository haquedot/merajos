import SavedLink from '../../../models/Link';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class LinksActionHandler implements ActionHandler {
  module = 'links';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString();

    if (action.opType === 'CREATE') {
      const url = action.targetData.url || action.targetData.link || 'https://google.com';
      const title = action.targetData.title || action.title || 'Saved Link';

      return await SavedLink.create({
        _id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title,
        url,
        description: action.targetData.description || '',
        category: action.targetData.category || 'General',
        tags: action.targetData.tags || ['bookmark', 'co-pilot'],
        isFavorite: action.targetData.isFavorite || false,
        createdAt: todayStr,
        updatedAt: todayStr
      });
    }

    if (action.opType === 'UPDATE') {
      if (action.entityId) {
        return await SavedLink.findOneAndUpdate(
          { _id: action.entityId, userId },
          { $set: { ...action.targetData, updatedAt: todayStr } },
          { new: true }
        );
      }
      const searchTitle = String(action.targetData?.title || action.targetData?.prompt || '').replace(/["']/g, '').trim();
      if (searchTitle) {
        return await SavedLink.findOneAndUpdate(
          { userId, title: { $regex: searchTitle, $options: 'i' } },
          { $set: { ...action.targetData, updatedAt: todayStr } },
          { new: true }
        );
      }
      return null;
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await SavedLink.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.title || action.targetData?.prompt || '');
      const cleanTitle = rawTarget.replace(/["']/g, '').replace(/^(delete|remove)\s+(bookmark|link)?\s*/i, '').trim();
      if (cleanTitle) {
        return await SavedLink.deleteMany({
          userId,
          title: { $regex: cleanTitle, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'links'`);
  }
}
