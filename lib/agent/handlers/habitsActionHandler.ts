import Habit from '../../../models/Habit';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class HabitsActionHandler implements ActionHandler {
  module = 'habits';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString().split('T')[0];

    if (action.opType === 'CREATE') {
      return await Habit.create({
        _id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name: action.targetData.name || action.targetData.title || action.title,
        frequency: action.targetData.frequency || 'daily',
        timeSlot: action.targetData.timeSlot || 'morning',
        currentStreak: 0,
        longestStreak: 0,
        history: {}
      });
    }

    if (action.opType === 'UPDATE') {
      const targetDateStr = String((action.targetData as any)?.date || todayStr);
      const dateKey = `history.${targetDateStr}`;

      if (action.entityId) {
        return await Habit.findOneAndUpdate(
          { _id: action.entityId, userId },
          {
            $set: { [dateKey]: true },
            $inc: { currentStreak: 1 }
          },
          { new: true }
        );
      }

      const habitName = String((action.targetData as any)?.name || (action.targetData as any)?.title || action.title || '').replace(/["']/g, '').trim();
      const habit = await Habit.findOne({
        userId,
        name: { $regex: habitName, $options: 'i' }
      });

      if (habit) {
        const historyRecord = (habit.history || {}) as Record<string, boolean>;
        historyRecord[targetDateStr] = true;
        habit.history = historyRecord;
        habit.currentStreak = (habit.currentStreak || 0) + 1;
        if (habit.currentStreak > (habit.longestStreak || 0)) {
          habit.longestStreak = habit.currentStreak;
        }
        await habit.save();
        return habit;
      }
      return null;
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await Habit.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.name || action.targetData?.title || action.targetData?.prompt || '');
      const cleanName = rawTarget.replace(/["']/g, '').replace(/^(delete|remove)\s+(habit)?\s*/i, '').trim();
      if (cleanName) {
        return await Habit.deleteMany({
          userId,
          name: { $regex: cleanName, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'habits'`);
  }
}
