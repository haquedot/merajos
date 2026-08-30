import CalendarEvent from '../../../models/CalendarEvent';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class CalendarActionHandler implements ActionHandler {
  module = 'calendar';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString().split('T')[0];

    if (action.opType === 'CREATE') {
      const startDate = String(action.targetData.startDate || action.targetData.date || todayStr);
      const endDate = String(action.targetData.endDate || startDate);

      return await CalendarEvent.create({
        _id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title: action.targetData.title || action.title,
        description: action.targetData.description || '',
        location: action.targetData.location || '',
        startDate,
        endDate,
        startTime: action.targetData.startTime || '10:00',
        endTime: action.targetData.endTime || '11:00',
        category: action.targetData.category || 'General',
        color: action.targetData.color || '#3b82f6'
      });
    }

    if (action.opType === 'UPDATE') {
      if (action.entityId) {
        return await CalendarEvent.findOneAndUpdate(
          { _id: action.entityId, userId },
          { $set: action.targetData },
          { new: true }
        );
      }
      const searchTitle = String(action.targetData?.title || action.targetData?.prompt || '').replace(/["']/g, '').trim();
      if (searchTitle) {
        return await CalendarEvent.findOneAndUpdate(
          { userId, title: { $regex: searchTitle, $options: 'i' } },
          { $set: action.targetData },
          { new: true }
        );
      }
      return null;
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await CalendarEvent.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.title || action.targetData?.prompt || '');
      const cleanTitle = rawTarget.replace(/["']/g, '').replace(/^(cancel|delete|remove)\s+(event|meeting)?\s*/i, '').trim();
      if (cleanTitle) {
        return await CalendarEvent.deleteMany({
          userId,
          title: { $regex: cleanTitle, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'calendar'`);
  }
}
