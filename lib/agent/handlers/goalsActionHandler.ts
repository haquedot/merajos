import Goal from '../../../models/Goal';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class GoalsActionHandler implements ActionHandler {
  module = 'goals';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    if (action.opType === 'CREATE') {
      const rawMs = Array.isArray((action.targetData as any)?.milestones)
        ? (action.targetData as any).milestones
        : Array.isArray((action.targetData as any)?.keyResults)
        ? (action.targetData as any).keyResults
        : [];

      const initialMilestones = rawMs.map((m: any, idx: number) => ({
        id: `ms_${Date.now()}_${idx}`,
        title: typeof m === 'string' ? m : m.title || `Milestone ${idx + 1}`,
        completed: false
      }));

      return await Goal.create({
        _id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title: action.targetData.title || action.title,
        description: action.targetData.description || '',
        tier: action.targetData.tier || 'monthly',
        targetDate: action.targetData.targetDate || new Date().toISOString().split('T')[0],
        progress: 0,
        priority: action.targetData.priority || 'medium',
        milestones: initialMilestones,
        completed: false
      });
    }

    if (action.opType === 'UPDATE') {
      const milestoneTitle = action.targetData.milestoneTitle || action.targetData.keyResult;

      if (action.entityId) {
        let goal = await Goal.findOne({ _id: action.entityId, userId });
        if (goal) {
          if (milestoneTitle) {
            const ms = goal.milestones.find((m: any) => m.title.toLowerCase().includes(String(milestoneTitle).toLowerCase()));
            if (ms) ms.completed = true;
          }
          const totalMs = goal.milestones.length;
          const doneMs = goal.milestones.filter((m: any) => m.completed).length;
          goal.progress = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : goal.progress;
          if (goal.progress >= 100) goal.completed = true;
          await goal.save();
          return goal;
        }
      }

      const goalTitleSearch = action.targetData.title ? String(action.targetData.title).replace(/["']/g, '').trim() : '';
      let goal = await Goal.findOne(goalTitleSearch ? { userId, title: { $regex: goalTitleSearch, $options: 'i' } } : { userId }).sort({ updatedAt: -1 });

      if (goal) {
        if (milestoneTitle) {
          const ms = goal.milestones.find((m: any) => m.title.toLowerCase().includes(String(milestoneTitle).toLowerCase()));
          if (ms) ms.completed = true;
        } else {
          goal.progress = action.targetData.progress !== undefined ? action.targetData.progress : goal.progress;
        }
        const totalMs = goal.milestones.length;
        const doneMs = goal.milestones.filter((m: any) => m.completed).length;
        if (totalMs > 0) goal.progress = Math.round((doneMs / totalMs) * 100);
        if (goal.progress >= 100) goal.completed = true;
        await goal.save();
        return goal;
      }
      return null;
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await Goal.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.title || action.targetData?.prompt || '');
      const cleanTitle = rawTarget.replace(/["']/g, '').replace(/^(delete|remove)\s+(goal)?\s*/i, '').trim();
      if (cleanTitle) {
        return await Goal.deleteMany({
          userId,
          title: { $regex: cleanTitle, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'goals'`);
  }
}
