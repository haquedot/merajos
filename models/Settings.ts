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
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', SettingsSchema);
