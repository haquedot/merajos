'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, FileText, Lightbulb, ArrowRight, Tag } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { Category, Priority } from '../../types';
import { db } from '../../database/dexie';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CaptureType = 'task' | 'note' | 'idea';

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [captureType, setCaptureType] = useState<CaptureType>('task');
  const [category, setCategory] = useState<Category>('Personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { addTask } = useTaskStore();

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSuccessToast(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (captureType === 'task') {
        await addTask({
          title: content.trim(),
          description: 'Captured via Universal Quick Capture (Ctrl+K)',
          dueDate: todayStr,
          priority: priority,
          status: 'todo',
          category: category,
          estimatedHours: 1,
          actualHours: 0,
          recurring: 'none',
          tags: [captureType, category.toLowerCase()],
          mit: false,
        });
        setSuccessToast('✓ Task created successfully!');
      } else if (captureType === 'note' || captureType === 'idea') {
        const id = `note_${Date.now()}`;
        await db.notes.add({
          id,
          title: captureType === 'idea' ? `💡 ${content.trim().slice(0, 40)}` : content.trim().slice(0, 40),
          content: `${captureType.toUpperCase()}: ${content.trim()}\n\nRecorded on ${new Date().toLocaleString()}`,
          category: category,
          pinned: false,
          folder: 'Inbox',
          updatedAt: new Date().toISOString(),
        });
        setSuccessToast(`✓ ${captureType === 'idea' ? 'Idea' : 'Note'} saved successfully!`);
      }

      setContent('');
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Quick capture error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F3B99] dark:text-[#6D5BFF]" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Universal Quick Capture
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500">
                Ctrl + K
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Capture Type Selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCaptureType('task')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  captureType === 'task'
                    ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>

              <button
                type="button"
                onClick={() => setCaptureType('note')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  captureType === 'note'
                    ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => setCaptureType('idea')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  captureType === 'idea'
                    ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Idea</span>
              </button>
            </div>

            {/* Input Text Area */}
            <div>
              <textarea
                autoFocus
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  captureType === 'task'
                    ? 'What needs to be done today?'
                    : captureType === 'note'
                    ? 'Jot down quick thoughts or notes...'
                    : 'Record a novel idea or feature concept...'
                }
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none"
              />
            </div>

            {/* Options Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Client Work">Client Work</option>
                    <option value="Research">Research</option>
                    <option value="Career">Career</option>
                    <option value="Habit">Habit</option>
                  </select>
                </div>

                {captureType === 'task' && (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="urgent">🔥 Urgent</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                {successToast && (
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    {successToast}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Capture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
