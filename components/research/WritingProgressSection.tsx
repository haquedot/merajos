'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, CheckCircle2, Save } from 'lucide-react';
import { ResearchSection } from '../../types';
import { useResearchStore } from '../../store/useResearchStore';

interface WritingProgressSectionProps {
  section: ResearchSection;
  projectId: string;
}

export const WritingProgressSection: React.FC<WritingProgressSectionProps> = ({
  section,
  projectId,
}) => {
  const { updateSection } = useResearchStore();

  const [currentWords, setCurrentWords] = useState(section.currentWords ?? 0);
  const [targetWords, setTargetWords] = useState(section.targetWords ?? 5000);
  const [writingStatus, setWritingStatus] = useState(section.writingStatus ?? 'drafting');
  const [content, setContent] = useState(section.content ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCurrentWords(section.currentWords ?? 0);
    setTargetWords(section.targetWords ?? 5000);
    setWritingStatus(section.writingStatus ?? 'drafting');
    setContent(section.content ?? '');
  }, [section]);

  const progress = targetWords > 0 ? Math.min(100, Math.round((currentWords / targetWords) * 100)) : 0;

  const handleSave = async () => {
    await updateSection(projectId, section.id, {
      currentWords: Number(currentWords),
      targetWords: Number(targetWords),
      writingStatus,
      content,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <p className="text-xs text-gray-500">Track word counts and draft your research manuscript</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={writingStatus}
              onChange={(e) => setWritingStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="not_started">Not Started</option>
              <option value="drafting">Drafting</option>
              <option value="reviewing">Under Review</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={handleSave}
              className="btn-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold"
            >
              {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Progress'}
            </button>
          </div>
        </div>

        {/* Word Count Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Current Word Count
            </label>
            <input
              type="number"
              value={currentWords}
              onChange={(e) => setCurrentWords(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Target Word Count Goal
            </label>
            <input
              type="number"
              value={targetWords}
              onChange={(e) => setTargetWords(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold text-gray-500 uppercase">Manuscript Progress</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">
              {currentWords.toLocaleString()} / {targetWords.toLocaleString()} words ({progress}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Writing Draft Editor Area */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Section Content & Draft Notes
        </label>
        <textarea
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start drafting section content, outline notes, or copy abstract..."
          className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed resize-y font-mono"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Content
          </button>
        </div>
      </div>
    </div>
  );
};
