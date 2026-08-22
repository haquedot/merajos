import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import Project from '../../../models/Project';
import Habit from '../../../models/Habit';
import DailyAnalyticsSnapshot from '../../../models/DailyAnalyticsSnapshot';
import { calculateDailyTasksAndLogAnalytics } from '../../../lib/cronCalculation';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    // Check if yesterday's snapshot is missing and auto-backfill it
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const userFilter = { $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] };

    const yesterdaySnapshot = await DailyAnalyticsSnapshot.findOne({ date: yesterdayStr, ...userFilter });
    if (!yesterdaySnapshot) {
      try {
        await calculateDailyTasksAndLogAnalytics(undefined, { sendEmail: false }, yesterdayStr);
      } catch (err) {
        console.error(`[Analytics API] Failed to auto-backfill snapshot (${yesterdayStr}):`, err);
      }
    }

    const tasks = await Task.find(userFilter).lean();
    const projects = await Project.find(userFilter).lean();
    const habits = await Habit.find(userFilter).lean();
    const snapshots = await DailyAnalyticsSnapshot.find(userFilter).sort({ date: -1 }).limit(30).lean();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalEstHours = tasks.reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((acc: number, t: any) => acc + (t.actualHours || 0), 0);

    const clientTasksCount = tasks.filter((t: any) => t.category === 'Client').length;
    const researchTasksCount = tasks.filter((t: any) => t.category === 'Research').length;
    const careerTasksCount = tasks.filter((t: any) => t.category === 'Career').length;
    const personalTasksCount = tasks.filter((t: any) => t.category === 'Personal' || t.category === 'Habit').length;

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks,
        taskCompletionRate,
        totalEstHours,
        totalActualHours,
        clientTasksCount,
        researchTasksCount,
        careerTasksCount,
        personalTasksCount,
        activeProjectsCount: projects.filter((p: any) => p.status === 'active').length,
        activeHabitsCount: habits.length,
      },
      snapshots,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
