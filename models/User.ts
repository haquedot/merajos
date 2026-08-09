import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name: string;
  picture?: string;
  role: 'student' | 'freelancer' | 'researcher' | 'professional' | 'custom';
  onboardingCompleted: boolean;
  enabledModules: string[];
  workStartTime?: string;
  workEndTime?: string;
  primaryGoal?: string;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    picture: { type: String },
    role: {
      type: String,
      enum: ['student', 'freelancer', 'researcher', 'professional', 'custom'],
      default: 'professional',
    },
    onboardingCompleted: { type: Boolean, default: false },
    enabledModules: {
      type: [String],
      default: ['tasks', 'calendar', 'habits', 'goals', 'notes', 'weekly_planner', 'analytics'],
    },
    workStartTime: { type: String, default: '09:00' },
    workEndTime: { type: String, default: '18:00' },
    primaryGoal: { type: String },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
