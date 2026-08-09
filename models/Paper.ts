import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPaper extends Document {
  title: string;
  authors: string;
  year?: number;
  doi?: string;
  pdfUrl?: string;
  status: 'to-read' | 'reading' | 'cited' | 'completed';
  methodology?: string;
  dataset?: string;
  findings?: string;
  citationText?: string;
  tags?: string[];
  userId?: string;
  createdAt: Date;
}

const PaperSchema = new Schema<IPaper>(
  {
    title: { type: String, required: true },
    authors: { type: String, required: true },
    year: { type: Number },
    doi: { type: String },
    pdfUrl: { type: String },
    status: {
      type: String,
      enum: ['to-read', 'reading', 'cited', 'completed'],
      default: 'to-read',
    },
    methodology: { type: String },
    dataset: { type: String },
    findings: { type: String },
    citationText: { type: String },
    tags: { type: [String], default: [] },
    userId: { type: String },
  },
  { timestamps: true }
);

export default models.Paper || model<IPaper>('Paper', PaperSchema);
