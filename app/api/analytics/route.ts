import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import Project from '../../../models/Project';
import Habit from '../../../models/Habit';
import DailyAnalyticsSnapshot from '../../../models/DailyAnalyticsSnapshot';

export async function GET() {
  try {
    await connectToDatabase();

    const tasks = await Task.find({}).lean();
    const projects = await Project.find({}).lean();
    const habits = await Habit.find({}).lean();
    const snapshots = await DailyAnalyticsSnapshot.find({}).sort({ date: -1 }).limit(30).lean();

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
