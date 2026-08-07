import mongoose, { Schema } from 'mongoose';
import { JobApplication, InterviewTopic, DSATopic } from '../types';

export interface CareerDocument {
  _id: string;
  jobs: JobApplication[];
  interviewTopics: InterviewTopic[];
  dsaTopics: DSATopic[];
}

const JobApplicationSchema = new Schema({
  id: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  appliedDate: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'], default: 'Applied' },
  salary: { type: String, default: '' },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  link: { type: String },
});

const InterviewTopicSchema = new Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  progress: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  resources: [{ title: String, url: String }],
  checklist: [{ id: String, task: String, completed: Boolean }],
});

const DSATopicSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  easySolved: { type: Number, default: 0 },
  easyTotal: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  mediumTotal: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  hardTotal: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  lastRevised: { type: String, default: '' },
});

const CareerSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    jobs: [JobApplicationSchema],
    interviewTopics: [InterviewTopicSchema],
    dsaTopics: [DSATopicSchema],
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Career || mongoose.model<CareerDocument>('Career', CareerSchema);
