'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useCareerStore } from '../../store/useCareerStore';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

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
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Design & Distributed Systems"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              options={[
                { value: 'Web Development', label: 'Web Development' },
                { value: 'System Architecture', label: 'System Architecture' },
                { value: 'CS Core', label: 'CS Fundamentals' },
                { value: 'Data Engineering', label: 'Data Engineering' },
                { value: 'DevOps', label: 'DevOps & Cloud' },
                { value: 'Mobile Development', label: 'Mobile Development' },
              ]}
            />
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
