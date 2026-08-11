'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, FileText } from 'lucide-react';
import { ResearchSection } from '../../types';
import { useResearchStore } from '../../store/useResearchStore';

interface GenericSectionProps {
  section: ResearchSection;
  projectId: string;
}

export const GenericSection: React.FC<GenericSectionProps> = ({
  section,
  projectId,
}) => {
  const { updateSection } = useResearchStore();

  const [content, setContent] = useState(section.content ?? '');
  const [description, setDescription] = useState(section.description ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(section.content ?? '');
    setDescription(section.description ?? '');
  }, [section]);

  const handleSave = async () => {
    await updateSection(projectId, section.id, {
      content,
      description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <p className="text-xs text-gray-500">
                {section.description || 'Custom research notes and section documentation'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Notes'}
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Notes & Documentation
          </label>
          <textarea
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write notes, markdown tables, dataset links, algorithm steps..."
            className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y font-mono"
          />
        </div>
      </div>
    </div>
  );
};
