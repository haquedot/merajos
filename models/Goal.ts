import mongoose, { Schema } from 'mongoose';
import { Goal as IGoal } from '../types';

export interface GoalDocument extends Omit<IGoal, 'id'> {
  _id: string;
}

const MilestoneSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const GoalSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tier: { type: String, enum: ['long_term', 'quarter', 'monthly', 'weekly', 'daily'], default: 'monthly' },
    targetDate: { type: String, default: '' },
    progress: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    milestones: [MilestoneSchema],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Goal || mongoose.model<GoalDocument>('Goal', GoalSchema);
