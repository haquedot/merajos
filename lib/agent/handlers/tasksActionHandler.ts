import Task from '../../../models/Task';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class TasksActionHandler implements ActionHandler {
  module = 'tasks';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      return await Task.create({
        _id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title: action.targetData.title || action.title,
        category: action.targetData.category || 'General',
        estimatedHours: action.targetData.estimatedHours || 1.0,
        priority: action.targetData.priority || 'medium',
        mit: action.targetData.mit || false,
        timeSlot: action.targetData.timeSlot || 'afternoon',
        dueDate: action.targetData.dueDate || new Date().toISOString().split('T')[0],
        status: 'todo'
      });
    }

    if (action.opType === 'UPDATE') {
      if (action.entityId) {
        return await Task.findOneAndUpdate(
          { _id: action.entityId, userId },
          { $set: action.targetData },
          { new: true }
        );
      }
      const searchTitle = String(action.targetData?.title || action.targetData?.prompt || '').replace(/["']/g, '').trim();
      if (searchTitle) {
        return await Task.findOneAndUpdate(
          { userId, title: { $regex: searchTitle, $options: 'i' } },
          { $set: action.targetData },
          { new: true }
        );
      }
      return null;
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await Task.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.title || action.targetData?.prompt || '');
      const cleanTitle = rawTarget
        .replace(/["']/g, '')
        .replace(/^(delete|remove)\s+/i, '')
        .replace(/\s*(task|from today's task|today)\s*/gi, '')
        .trim();

      if (cleanTitle) {
        return await Task.deleteMany({
          userId,
          title: { $regex: cleanTitle, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'tasks'`);
  }
}
