import mongoose, { Schema } from 'mongoose';
import { Task as ITask } from '../types';

export interface TaskDocument extends Omit<ITask, 'id'> {
  _id: string;
}

const TaskSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    googleTaskId: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'completed', 'archived'], default: 'todo' },
    category: { type: String, enum: ['Client', 'Research', 'Career', 'Personal', 'College', 'Habit'], default: 'Personal' },
    projectId: { type: String },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    dueDate: { type: String, required: true },
    time: { type: String },
    recurring: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    mit: { type: Boolean, default: false },
    timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    completedAt: { type: String },
    lastSyncedAt: { type: String },
    syncStatus: { type: String, enum: ['synced', 'pending', 'error'], default: 'synced' },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
