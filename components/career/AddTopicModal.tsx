'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useCareerStore } from '../../store/useCareerStore';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface AddTopicModalProps {
  isOpen: boolean;
  subjectId: string | null;
  onClose: () => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, subjectId, onClose }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [description, setDescription] = useState('');
  const [checklistRaw, setChecklistRaw] = useState('');
  const [resourceRaw, setResourceRaw] = useState('');
  const [notes, setNotes] = useState('');

  const { addSubjectTopic } = useCareerStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    // Parse checklist lines
    const checklistItems = checklistRaw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        title: line,
        completed: false,
      }));

    // Parse resource lines (Title | URL)
    const resources = resourceRaw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split('|');
        return {
          title: parts[0]?.trim() || 'Resource Link',
          url: parts[1]?.trim() || parts[0]?.trim() || 'https://google.com',
        };
      });

    addSubjectTopic(subjectId, {
      title: title.trim(),
      difficulty,
      description: description.trim(),
      status: 'todo',
      resources,
      checklist: checklistItems,
      notes: notes.trim(),
    });

    setTitle('');
    setDescription('');
    setChecklistRaw('');
    setResourceRaw('');
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Topic & Curriculum Checklist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Topic Title *
          </label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Microtask Queue & Promises in Node.js"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <Select
            value={difficulty}
            onValueChange={(val) => setDifficulty(val as any)}
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Resource Links (One per line: Title | URL)
          </label>
          <textarea
            rows={3}
            value={resourceRaw}
            onChange={(e) => setResourceRaw(e.target.value)}
            placeholder="React Docs | https://react.dev&#10;MDN Web Security | https://developer.mozilla.org"
            className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Mastery Checklist (One item per line)
          </label>
          <textarea
            rows={4}
            value={checklistRaw}
            onChange={(e) => setChecklistRaw(e.target.value)}
            placeholder="Understand event loop execution order&#10;Implement Debounce & Throttle from scratch&#10;Audit LCP & INP metrics"
            className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Topic Summary / Key Takeaways
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key formula, code snippet, or interview tip..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Topic
          </Button>
        </div>
      </form>
    </Modal>
  );
};
