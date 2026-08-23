import mongoose, { Schema } from 'mongoose';
import { JobApplication, InterviewTopic, DSATopic, SubjectPlan } from '../types';

export interface CareerDocument {
  _id: string;
  jobs: JobApplication[];
  interviewTopics: InterviewTopic[];
  dsaTopics: DSATopic[];
  subjectPlans: SubjectPlan[];
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

const SubjectTopicChecklistSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const SubjectTopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  status: { type: String, enum: ['todo', 'in_progress', 'mastered'], default: 'todo' },
  resources: [{ title: String, url: String }],
  checklist: [SubjectTopicChecklistSchema],
  notes: { type: String, default: '' },
  lastRevised: { type: String, default: '' },
});

const SubjectPlanSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  colorTheme: { type: String, default: '#1F3B99' },
  topics: [SubjectTopicSchema],
  createdAt: { type: String },
  updatedAt: { type: String },
  isPublic: { type: Boolean, default: false },
  sharedWithEmails: [{ type: String }],
  ownerEmail: { type: String, default: '' },
});

const CareerSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    jobs: [JobApplicationSchema],
    interviewTopics: [InterviewTopicSchema],
    dsaTopics: [DSATopicSchema],
    subjectPlans: [SubjectPlanSchema],
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Career || mongoose.model<CareerDocument>('Career', CareerSchema);
