import mongoose, { Schema } from 'mongoose';
import { Habit as IHabit } from '../types';

export interface HabitDocument extends Omit<IHabit, 'id'> {
  _id: string;
}

const HabitSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Spiritual' },
    icon: { type: String, default: 'Check' },
    targetDaysPerWeek: { type: Number, default: 7 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    history: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Habit || mongoose.model<HabitDocument>('Habit', HabitSchema);
