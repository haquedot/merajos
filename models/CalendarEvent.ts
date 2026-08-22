import mongoose, { Schema } from 'mongoose';
import { CalendarEvent as ICalendarEvent } from '../types';

export interface CalendarEventDocument extends Omit<ICalendarEvent, 'id'> {
  _id: string;
}

const CalendarEventSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    googleEventId: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    color: { type: String, default: '#3b82f6' },
    category: { type: String, default: 'Personal' },
    taskId: { type: String },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    lastSyncedAt: { type: String },
    syncStatus: { type: String, enum: ['synced', 'pending', 'error'], default: 'synced' },
  },
  { timestamps: true, _id: false }
);

CalendarEventSchema.index({ userId: 1, startDate: 1 });

export default mongoose.models.CalendarEvent || mongoose.model<CalendarEventDocument>('CalendarEvent', CalendarEventSchema);
