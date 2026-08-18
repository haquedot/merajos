'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { SavedLink } from '../../types';
import { Link2, Globe, Tag, Star, FolderPlus, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<SavedLink>) => Promise<void>;
  initialData?: SavedLink | null;
  categories: string[];
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setUrl(initialData.url || '');
      setDescription(initialData.description || '');
      setCategory(categories.includes(initialData.category) ? initialData.category : 'Custom');
      if (!categories.includes(initialData.category) && initialData.category !== 'All') {
        setCustomCategory(initialData.category);
      } else {
        setCustomCategory('');
      }
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      setIsFavorite(initialData.isFavorite || false);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategory('Development');
      setCustomCategory('');
      setTagsInput('');
      setIsFavorite(false);
    }
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title for the link.');
      return;
    }

    if (!url.trim()) {
      toast.error('Please enter a valid URL.');
      return;
    }

    // Auto-fix URL scheme
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        url: formattedUrl,
        description: description.trim(),
        category: finalCategory,
        tags: parsedTags,
        isFavorite,
      });
      toast.success(initialData ? 'Link updated successfully!' : 'New link saved successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to save link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bookmark Link' : 'Save New Bookmark Link'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-indigo-500" /> Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Next.js Documentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" /> URL Web Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. https://nextjs.org/docs"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Category & Custom Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-purple-500" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['Development', 'Design', 'Tools', 'Reading', 'Personal', 'Research', 'Work', 'Finance', 'Custom'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {category === 'Custom' && (
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Custom Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-emerald-500" /> Description / Notes
          </label>
          <textarea
            rows={2}
            placeholder="Short notes or summary of what this link is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-500" /> Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Next.js, React, UI"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Favorite Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="favorite-toggle"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700"
          />
          <label
            htmlFor="favorite-toggle"
            className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer flex items-center gap-1"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
            Mark as Favorite Bookmark
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold px-5 py-2 btn-primary text-white shadow-md"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
