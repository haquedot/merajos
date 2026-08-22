import mongoose, { Schema, Document } from 'mongoose';

export interface IDerivedSignal extends Document {
  userId: string;
  signalKey: string;
  category?: string;
  timeSlot?: string;
  value: number;
  sampleSize: number;
  confidence: number;
  lastObservedAt: string;
  observationWindowDays: number;
  recencyWeight: number;
  baseline: number;
  createdAt: Date;
  updatedAt: Date;
}

const DerivedSignalSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    signalKey: { type: String, required: true },
    category: { type: String },
    timeSlot: { type: String },
    value: { type: Number, required: true },
    sampleSize: { type: Number, required: true, default: 0 },
    confidence: { type: Number, required: true, default: 0 },
    lastObservedAt: { type: String, required: true },
    observationWindowDays: { type: Number, default: 30 },
    recencyWeight: { type: Number, default: 1.0 },
    baseline: { type: Number, default: 0.5 },
  },
  { timestamps: true }
);

DerivedSignalSchema.index({ userId: 1, signalKey: 1 }, { unique: true });

export default mongoose.models.DerivedSignal ||
  mongoose.model<IDerivedSignal>('DerivedSignal', DerivedSignalSchema);
