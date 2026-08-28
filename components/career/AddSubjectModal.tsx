'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useCareerStore } from '../../store/useCareerStore';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = [
  'Web Development',
  'System Architecture',
  'CS Fundamentals',
  'Data Engineering',
  'DevOps & Cloud',
  'Mobile Development',
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('#1F3B99');

  const { addSubjectPlan, subjectPlans } = useCareerStore();

  // Combine default categories with any existing custom categories from active store
  const categoryOptions = useMemo(() => {
    const existing = new Set(DEFAULT_CATEGORIES);
    subjectPlans.forEach((sp) => {
      if (sp.category) existing.add(sp.category);
    });
    const opts = Array.from(existing).map((cat) => ({ value: cat, label: cat }));
    opts.push({ value: '__custom__', label: '+ Create Custom Category...' });
    return opts;
  }, [subjectPlans]);

  const handleCategorySelectChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setSelectedCategory(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = isCustom
      ? customCategory.trim() || 'General'
      : selectedCategory.trim();

    addSubjectPlan({
      title: title.trim(),
      category: finalCategory,
      description: description.trim(),
      colorTheme,
      topics: [],
    });

    setTitle('');
    setCustomCategory('');
    setIsCustom(false);
    setSelectedCategory('Web Development');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Subject Study Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Subject Title *
          </label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Design & Distributed Systems"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] font-bold text-[#0066FF] dark:text-blue-400 hover:underline"
              >
                {isCustom ? 'Select Preset' : '+ Custom Category'}
              </button>
            </div>

            {isCustom ? (
              <Input
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                autoFocus
              />
            ) : (
              <Select
                value={selectedCategory}
                onValueChange={handleCategorySelectChange}
                options={categoryOptions}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Accent Color
            </label>
            <input
              type="color"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full h-10 p-1 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 cursor-pointer shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key roadmap goals, interview outcomes, target deadline..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Subject Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
