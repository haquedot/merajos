import mongoose, { Schema } from 'mongoose';
import { Project as IProject } from '../types';

export interface ProjectDocument extends Omit<IProject, 'id'> {
  _id: string;
}

const ProjectFeatureSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: String },
});

const ProjectBugSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  createdAt: { type: String },
});

const ProjectInvoiceSchema = new Schema({
  id: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
  dueDate: { type: String, default: '' },
  paidDate: { type: String, default: '' },
  notes: { type: String, default: '' },
});

const ProjectSharedUserSchema = new Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ['view', 'edit'], default: 'view' },
  addedAt: { type: String },
});

const ProjectSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    clientName: { type: String, default: '' },
    clientEmail: { type: String, default: '' },
    clientPhone: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'on_hold', 'archived'], default: 'active' },
    progress: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: '$' },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    startDate: { type: String, default: '' },
    deadline: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    features: [ProjectFeatureSchema],
    bugs: [ProjectBugSchema],
    invoices: [ProjectInvoiceSchema],
    techStack: [{ type: String }],
    notes: { type: String, default: '' },
    sharedWith: [ProjectSharedUserSchema],
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);
