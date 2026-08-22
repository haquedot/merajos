import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyTaskDetail {
  title: string;
  category: string;
  priority: string;
  status: string;
}

export interface IDailyAnalyticsSnapshot {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completedTaskTitles: string[];
  pendingTaskTitles: string[];
  completedTaskDetails?: IDailyTaskDetail[];
  pendingTaskDetails?: IDailyTaskDetail[];
  taskCompletionRate: number;
  totalEstHours: number;
  totalActualHours: number;
  clientTasksCount: number;
  researchTasksCount: number;
  careerTasksCount: number;
  personalTasksCount: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  habitCompletionRate: number;
  completedGoalsCount: number;
  totalGoalsCount: number;
  activeProjectsCount: number;
  categoryBreakdown: {
    Client: { completed: number; pending: number };
    Research: { completed: number; pending: number };
    Career: { completed: number; pending: number };
    Personal: { completed: number; pending: number };
  };
  priorityBreakdown: {
    urgent: { completed: number; pending: number };
    high: { completed: number; pending: number };
    medium: { completed: number; pending: number };
    low: { completed: number; pending: number };
  };
  productivityScore: number;
  calculatedAt: string;
}

export interface DailyAnalyticsSnapshotDocument extends IDailyAnalyticsSnapshot, Document {}

const DailyAnalyticsSnapshotSchema: Schema = new Schema(
  {
    date: { type: String, required: true },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    completedTaskTitles: { type: [String], default: [] },
    pendingTaskTitles: { type: [String], default: [] },
    completedTaskDetails: [
      {
        title: { type: String },
        category: { type: String },
        priority: { type: String },
        status: { type: String },
      },
    ],
    pendingTaskDetails: [
      {
        title: { type: String },
        category: { type: String },
        priority: { type: String },
        status: { type: String },
      },
    ],
    taskCompletionRate: { type: Number, default: 0 },
    totalEstHours: { type: Number, default: 0 },
    totalActualHours: { type: Number, default: 0 },
    clientTasksCount: { type: Number, default: 0 },
    researchTasksCount: { type: Number, default: 0 },
    careerTasksCount: { type: Number, default: 0 },
    personalTasksCount: { type: Number, default: 0 },
    completedHabitsCount: { type: Number, default: 0 },
    totalHabitsCount: { type: Number, default: 0 },
    habitCompletionRate: { type: Number, default: 0 },
    completedGoalsCount: { type: Number, default: 0 },
    totalGoalsCount: { type: Number, default: 0 },
    activeProjectsCount: { type: Number, default: 0 },
    categoryBreakdown: {
      Client: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      Research: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      Career: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      Personal: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
    },
    priorityBreakdown: {
      urgent: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      high: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      medium: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
      low: { completed: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
    },
    productivityScore: { type: Number, default: 0 },
    calculatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

DailyAnalyticsSnapshotSchema.index({ userId: 1, date: -1 });

export default mongoose.models.DailyAnalyticsSnapshot ||
  mongoose.model<DailyAnalyticsSnapshotDocument>('DailyAnalyticsSnapshot', DailyAnalyticsSnapshotSchema);
