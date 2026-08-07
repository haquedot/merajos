import mongoose, { Schema } from 'mongoose';
import { Paper, WritingSection, ResearchOverview } from '../types';

export interface ResearchDocument {
  _id: string;
  overview: ResearchOverview;
  papers: Paper[];
  writingSections: WritingSection[];
}

const PaperSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  authors: { type: String, default: '' },
  year: { type: Number, default: 2026 },
  source: { type: String, default: '' },
  notes: { type: String, default: '' },
  citation: { type: String, default: '' },
  status: { type: String, enum: ['unread', 'reading', 'cited', 'archived'], default: 'unread' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [{ type: String }],
  pdfUrl: { type: String },
  readingTimeMinutes: { type: Number, default: 30 },
});

const WritingSectionSchema = new Schema({
  id: { type: String, required: true },
  section: { type: String, required: true },
  targetWords: { type: Number, default: 1000 },
  currentWords: { type: Number, default: 0 },
  status: { type: String, enum: ['not_started', 'drafting', 'reviewing', 'completed'], default: 'not_started' },
});

const ResearchSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    overview: {
      topic: { type: String, default: 'Research & Thesis Dashboard' },
      thesisTitle: { type: String, default: 'My Thesis Title' },
      paperTitle: { type: String, default: 'Research Topic' },
      progress: { type: Number, default: 0 },
      hoursSpent: { type: Number, default: 0 },
      papersRead: { type: Number, default: 0 },
      writingProgress: { type: Number, default: 0 },
    },
    papers: [PaperSchema],
    writingSections: [WritingSectionSchema],
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Research || mongoose.model<ResearchDocument>('Research', ResearchSchema);
