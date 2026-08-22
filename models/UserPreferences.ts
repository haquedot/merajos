import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: string;
  userEmail: string;
  targetRole: string;
  preferredFocusDurationMinutes: number;
  maxDailyMITs: number;
  dailyCapacityHours: number;
  personalizationEnabled: boolean;
  learnFromTaskBehavior: boolean;
  learnFromFocusSessions: boolean;
  learnFromHabits: boolean;
  categorySlotAffinity: {
    Career?: string;
    Research?: string;
    Client?: string;
    Personal?: string;
    College?: string;
    [key: string]: string | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true, index: true },
    targetRole: { type: String, default: 'Software Engineer' },
    preferredFocusDurationMinutes: { type: Number, default: 45 },
    maxDailyMITs: { type: Number, default: 3 },
    dailyCapacityHours: { type: Number, default: 7.0 },
    personalizationEnabled: { type: Boolean, default: true },
    learnFromTaskBehavior: { type: Boolean, default: true },
    learnFromFocusSessions: { type: Boolean, default: true },
    learnFromHabits: { type: Boolean, default: true },
    categorySlotAffinity: {
      Career: { type: String, default: 'morning' },
      Research: { type: String, default: 'afternoon' },
      Client: { type: String, default: 'morning' },
      Personal: { type: String, default: 'evening' },
      College: { type: String, default: 'morning' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
