import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IRoutine extends Document {
  title: string;
  timeBlock: 'morning' | 'afternoon' | 'evening' | 'night';
  suggestedTime?: string; // e.g. "06:00"
  category: string;
  icon?: string;
  completedDates: string[];
  userId?: string;
  createdAt: Date;
}

const RoutineSchema = new Schema<IRoutine>(
  {
    title: { type: String, required: true },
    timeBlock: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning',
    },
    suggestedTime: { type: String },
    category: { type: String, default: 'Personal' },
    icon: { type: String },
    completedDates: { type: [String], default: [] },
    userId: { type: String },
  },
  { timestamps: true }
);

export default models.Routine || model<IRoutine>('Routine', RoutineSchema);
