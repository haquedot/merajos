import { connectToDatabase } from './mongodb';
import Task from '../models/Task';
import Project from '../models/Project';
import Habit from '../models/Habit';
import Goal from '../models/Goal';
import DailyAnalyticsSnapshot from '../models/DailyAnalyticsSnapshot';
import { sendDailyTaskLogEmail } from './emailService';
import { calculateDailyScore } from './productivityCalculator';

import { Task as ITask } from '../types';

const matchesCategory = (taskCat: string | undefined, targetCat: string) => {
  if (!taskCat) return targetCat === 'Personal';
  const c = taskCat.toLowerCase();
  const tgt = targetCat.toLowerCase();
  if (tgt === 'personal') return c === 'personal' || c === 'habit' || c === 'college';
  return c === tgt;
};

export async function calculateDailyTasksAndLogAnalytics(
  clientTasks?: Partial<ITask>[],
  emailOptions?: { enabled?: boolean; recipientEmail?: string; sendEmail?: boolean },
  targetDateStr?: string
) {
  await connectToDatabase();

  const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
  const calculatedAt = new Date().toISOString();

  // If client tasks are passed, bulk upsert them into MongoDB first by String _id query
  if (clientTasks && Array.isArray(clientTasks) && clientTasks.length > 0) {
    for (const task of clientTasks) {
      const taskId = task.id || (task as any)._id;
      if (taskId) {
        await Task.findOneAndUpdate(
          { _id: taskId },
          {
            $set: {
              _id: taskId,
              title: task.title || 'Untitled Task',
              description: task.description || '',
              status: task.status || 'todo',
              category: task.category || 'Personal',
              priority: task.priority || 'medium',
              dueDate: task.dueDate || todayStr,
              estimatedHours: task.estimatedHours || 1,
              actualHours: task.actualHours !== undefined ? task.actualHours : (task.status === 'completed' ? 1 : 0),
              mit: !!task.mit,
              googleTaskId: task.googleTaskId || taskId,
            },
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
  }

  // Fetch all tasks from MongoDB
  const allTasks = (await Task.find({}).lean()) as unknown as ITask[];
  const completedTasksList = allTasks.filter((t) => t.status === 'completed');
  const pendingTasksList = allTasks.filter((t) => t.status !== 'completed');

  const totalTasks = allTasks.length;
  const completedTasks = completedTasksList.length;
  const pendingTasks = pendingTasksList.length;

  const completedTaskTitles = completedTasksList.map((t: any) => t.title || 'Untitled Task');
  const pendingTaskTitles = pendingTasksList.map((t: any) => t.title || 'Untitled Task');

  const completedTaskDetails = completedTasksList.map((t: any) => ({
    title: t.title || 'Untitled Task',
    category: t.category || 'Personal',
    priority: t.priority || 'medium',
    status: t.status || 'completed',
  }));

  const pendingTaskDetails = pendingTasksList.map((t: any) => ({
    title: t.title || 'Untitled Task',
    category: t.category || 'Personal',
    priority: t.priority || 'medium',
    status: t.status || 'todo',
  }));

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const totalEstHours = allTasks.reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);
  const totalActualHours = allTasks.reduce((acc: number, t: any) => acc + (t.actualHours || 0), 0);

  const clientTasksCount = allTasks.filter((t: any) => matchesCategory(t.category, 'Client')).length;
  const researchTasksCount = allTasks.filter((t: any) => matchesCategory(t.category, 'Research')).length;
  const careerTasksCount = allTasks.filter((t: any) => matchesCategory(t.category, 'Career')).length;
  const personalTasksCount = allTasks.filter((t: any) => matchesCategory(t.category, 'Personal')).length;

  // Category breakdown
  const categoryBreakdown = {
    Client: {
      completed: allTasks.filter((t: any) => matchesCategory(t.category, 'Client') && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => matchesCategory(t.category, 'Client') && t.status !== 'completed').length,
    },
    Research: {
      completed: allTasks.filter((t: any) => matchesCategory(t.category, 'Research') && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => matchesCategory(t.category, 'Research') && t.status !== 'completed').length,
    },
    Career: {
      completed: allTasks.filter((t: any) => matchesCategory(t.category, 'Career') && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => matchesCategory(t.category, 'Career') && t.status !== 'completed').length,
    },
    Personal: {
      completed: allTasks.filter((t: any) => matchesCategory(t.category, 'Personal') && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => matchesCategory(t.category, 'Personal') && t.status !== 'completed').length,
    },
  };

  // Priority breakdown
  const priorityBreakdown = {
    urgent: {
      completed: allTasks.filter((t: any) => t.priority === 'urgent' && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => t.priority === 'urgent' && t.status !== 'completed').length,
    },
    high: {
      completed: allTasks.filter((t: any) => t.priority === 'high' && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => t.priority === 'high' && t.status !== 'completed').length,
    },
    medium: {
      completed: allTasks.filter((t: any) => t.priority === 'medium' && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => t.priority === 'medium' && t.status !== 'completed').length,
    },
    low: {
      completed: allTasks.filter((t: any) => t.priority === 'low' && t.status === 'completed').length,
      pending: allTasks.filter((t: any) => t.priority === 'low' && t.status !== 'completed').length,
    },
  };

  // Habits statistics
  const allHabits = await Habit.find({}).lean();
  const totalHabitsCount = allHabits.length;
  const completedHabitsCount = allHabits.filter((h: any) => h.history && !!h.history[todayStr]).length;
  const habitCompletionRate = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // Goals & Projects
  const activeProjectsCount = await Project.countDocuments({ status: 'active' });
  const allGoals = await Goal.find({}).lean();
  const totalGoalsCount = allGoals.length;
  const completedGoalsCount = allGoals.filter((g: any) => g.progress >= 100).length;

  // --- Dynamic Modular Daily Score Engine ---
  const { dailyScore: productivityScore } = calculateDailyScore({
    todayTasks: allTasks,
    habitsCount: totalHabitsCount,
    completedHabitsCount: completedHabitsCount,
    projectsCount: activeProjectsCount,
    goalsCount: totalGoalsCount,
    completedGoalsCount: completedGoalsCount,
    researchCount: allTasks.filter((t: any) => matchesCategory(t.category, 'Research')).length,
    dsaCount: allTasks.filter((t: any) => matchesCategory(t.category, 'Career')).length,
  });

  // Upsert snapshot into MongoDB
  const snapshot = await DailyAnalyticsSnapshot.findOneAndUpdate(
    { date: todayStr },
    {
      $set: {
        date: todayStr,
        totalTasks,
        completedTasks,
        pendingTasks,
        completedTaskTitles,
        pendingTaskTitles,
        completedTaskDetails,
        pendingTaskDetails,
        taskCompletionRate,
        totalEstHours,
        totalActualHours,
        clientTasksCount,
        researchTasksCount,
        careerTasksCount,
        personalTasksCount,
        completedHabitsCount,
        totalHabitsCount,
        habitCompletionRate,
        completedGoalsCount,
        totalGoalsCount,
        activeProjectsCount,
        categoryBreakdown,
        priorityBreakdown,
        productivityScore,
        calculatedAt,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  let emailResult = null;
  // Send email ONLY if sendEmail is explicitly true or undefined (for 11:45 PM cron/manual run)
  if (emailOptions?.sendEmail !== false) {
    console.log(`[Snapshot] Snapshot saved for ${todayStr}. Triggering email dispatch...`);
    emailResult = await sendDailyTaskLogEmail(snapshot.toObject(), allTasks, emailOptions);
  } else {
    console.log(`[Snapshot] Snapshot saved for ${todayStr}. Email dispatch skipped (sendEmail=false).`);
  }

  return {
    snapshot: snapshot.toObject(),
    emailResult,
  };
}
