import mongoose, { Schema, Document } from 'mongoose';

const ResearchPaperSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    authors: { type: String, default: '' },
    year: { type: Number, default: new Date().getFullYear() },
    source: { type: String, default: '' },
    pdfUrl: { type: String },
    doi: { type: String },
    status: { type: String, default: 'unread' },
    isImportant: { type: Boolean, default: false },
    summary: { type: String, default: '' },
    notes: { type: String, default: '' },
    citation: { type: String, default: '' },
    tags: [{ type: String }],
    readingTimeMinutes: { type: Number, default: 0 },
    addedAt: { type: String },
  },
  { _id: false }
);

const ResearchSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    papers: [ResearchPaperSchema],
    targetWords: { type: Number },
    currentWords: { type: Number },
    writingStatus: { type: String },
    content: { type: String },
    createdAt: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ResearchProjectSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    field: { type: String },
    status: { type: String, default: 'active' },
    progress: { type: Number, default: 0 },
    color: { type: String, default: '#3b82f6' },
    sections: [ResearchSectionSchema],
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { _id: false }
);

const ResearchDocSchema = new Schema(
  {
    _id: { type: String, required: true }, // e.g. 'research-main'
    projects: [ResearchProjectSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Research || mongoose.model('Research', ResearchDocSchema);
