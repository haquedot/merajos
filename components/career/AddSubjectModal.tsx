'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useCareerStore } from '../../store/useCareerStore';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('#1F3B99');

  const { addSubjectPlan } = useCareerStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSubjectPlan({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      colorTheme,
      topics: [],
    });

    setTitle('');
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
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Design & Distributed Systems"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            >
              <option value="Web Development">Web Development</option>
              <option value="System Architecture">System Architecture</option>
              <option value="CS Core">CS Fundamentals</option>
              <option value="Data Engineering">Data Engineering</option>
              <option value="DevOps">DevOps & Cloud</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Accent Color
            </label>
            <input
              type="color"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full h-9 p-1 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer"
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
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs font-bold">
            Create Subject Plan
          </button>
        </div>
      </form>
    </Modal>
  );
};
