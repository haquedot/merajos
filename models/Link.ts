import mongoose, { Schema } from 'mongoose';
import { SavedLink as ISavedLink } from '../types';

export interface LinkDocument extends Omit<ISavedLink, 'id'> {
  _id: string;
}

const LinkSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.SavedLink || mongoose.model<LinkDocument>('SavedLink', LinkSchema);
