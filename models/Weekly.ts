import mongoose, { Schema } from 'mongoose';
import { WeeklyPlan as IWeeklyPlan } from '../types';

export interface WeeklyDocument extends Omit<IWeeklyPlan, 'weekId'> {
  _id: string;
}

const WeeklySchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    topPriorities: [{ type: String }],
    researchGoals: [{ type: String }],
    careerGoals: [{ type: String }],
    clientGoals: [{ type: String }],
    personalGoals: [{ type: String }],
    brainDump: { type: String, default: '' },
    nextWeekGoals: [{ type: String }],
    review: {
      wins: { type: String, default: '' },
      losses: { type: String, default: '' },
      improvements: { type: String, default: '' },
      score: { type: Number, default: 0 },
    },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Weekly || mongoose.model<WeeklyDocument>('Weekly', WeeklySchema);
