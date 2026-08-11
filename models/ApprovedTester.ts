import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovedTester extends Document {
  email: string;
  approvedAt: Date;
  addedBy?: string;
}

const ApprovedTesterSchema = new Schema<IApprovedTester>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    approvedAt: { type: Date, default: Date.now },
    addedBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.models.ApprovedTester ||
  mongoose.model<IApprovedTester>('ApprovedTester', ApprovedTesterSchema);
