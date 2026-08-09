import mongoose, { Schema } from 'mongoose';
import { Project as IProject } from '../types';

export interface ProjectDocument extends Omit<IProject, 'id'> {
  _id: string;
}

const ProjectFeatureSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const ProjectBugSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
});

const ProjectSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    clientName: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'on_hold'], default: 'active' },
    progress: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    deadline: { type: String, default: '' },
    features: [ProjectFeatureSchema],
    bugs: [ProjectBugSchema],
    techStack: [{ type: String }],
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);
