import Weekly from '../../../models/Weekly';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class WeeklyActionHandler implements ActionHandler {
  module = 'weekly';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const today = new Date();
    // Default current week ID e.g. "2026-W35"
    const year = today.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const weekNum = Math.ceil((((today.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
    const currentWeekId = `${year}-W${weekNum < 10 ? '0' + weekNum : weekNum}`;
    const weekId = String((action.targetData as any)?.weekId || currentWeekId);

    let weeklyPlan = await Weekly.findOne({ _id: weekId });

    if (!weeklyPlan) {
      weeklyPlan = await Weekly.create({
        _id: weekId,
        topPriorities: [],
        researchGoals: [],
        careerGoals: [],
        clientGoals: [],
        personalGoals: [],
        brainDump: '',
        nextWeekGoals: [],
        review: { wins: '', losses: '', improvements: '', score: 0 }
      });
    }

    if (action.opType === 'CREATE' || action.opType === 'UPDATE') {
      const priority = (action.targetData as any)?.priority || (action.targetData as any)?.title || action.title;
      if (priority && typeof priority === 'string') {
        const cleanPriority = priority.replace(/["']/g, '').trim();
        if (cleanPriority && !weeklyPlan.topPriorities.includes(cleanPriority)) {
          weeklyPlan.topPriorities.push(cleanPriority);
        }
      }

      if ((action.targetData as any)?.brainDump) {
        weeklyPlan.brainDump = String((action.targetData as any).brainDump);
      }

      await weeklyPlan.save();
      return weeklyPlan;
    }

    if (action.opType === 'DELETE') {
      const priorityToRemove = String((action.targetData as any)?.title || action.title || '').replace(/["']/g, '').trim();
      if (priorityToRemove) {
        weeklyPlan.topPriorities = weeklyPlan.topPriorities.filter((p: string) => !p.toLowerCase().includes(priorityToRemove.toLowerCase()));
        await weeklyPlan.save();
        return weeklyPlan;
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'weekly'`);
  }
}
