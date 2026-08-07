import mongoose, { Schema } from 'mongoose';
import { UserSettings } from '../types';

export interface SettingsDocument extends Omit<UserSettings, 'id'> {
  _id: string;
}

const SettingsSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    accentColor: { type: String, default: '#6D5BFF' },
    sidebarCollapsed: { type: Boolean, default: false },
    pomodoroTime: { type: Number, default: 25 },
    soundEnabled: { type: Boolean, default: true },
    emailNotificationsEnabled: { type: Boolean, default: false },
    notificationEmail: { type: String, default: '' },
    onboarding: {
      displayName: { type: String, default: '' },
      role: {
        type: String,
        enum: ['student', 'freelancer', 'researcher', 'professional', 'custom'],
        default: 'custom',
      },
      enabledModules: { type: [String], default: [] },
      workStartTime: { type: String, default: '09:00' },
      workEndTime: { type: String, default: '18:00' },
      primaryGoal: { type: String, default: '' },
      onboardingCompleted: { type: Boolean, default: false },
      onboardingCompletedAt: { type: String, default: null },
    },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', SettingsSchema);

