import mongoose, { Schema } from 'mongoose';
import { Note as INote } from '../types';

export interface NoteDocument extends Omit<INote, 'id'> {
  _id: string;
}

const NoteSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    category: { type: String, default: 'Personal' },
    pinned: { type: Boolean, default: false },
    folder: { type: String, default: 'General' },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Note || mongoose.model<NoteDocument>('Note', NoteSchema);
