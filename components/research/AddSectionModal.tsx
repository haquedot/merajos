'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ResearchSectionType } from '../../types';
import { useResearchStore } from '../../store/useResearchStore';
import { BookOpen, PenTool, Database, Cpu, Image, FileText, FolderPlus } from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const SECTION_TYPE_OPTIONS: {
  type: ResearchSectionType;
  label: string;
  description: string;
  icon: any;
}[] = [
  {
    type: 'literature_review',
    label: 'Literature Review',
    description: 'Track research papers, read status, citations & takeaways',
    icon: BookOpen,
  },
  {
    type: 'writing',
    label: 'Thesis / Writing Progress',
    description: 'Track word counts, drafting milestones & status',
    icon: PenTool,
  },
  {
    type: 'datasets',
    label: 'Datasets & Benchmarks',
    description: 'Notes on training data, evaluation metrics & splits',
    icon: Database,
  },
  {
    type: 'algorithms',
    label: 'Algorithms & Architecture',
    description: 'Pseudos, model architecture notes & hyperparams',
    icon: Cpu,
  },
  {
    type: 'diagrams',
    label: 'Diagrams & Figures',
    description: 'System diagrams, charts & visual assets tracker',
    icon: Image,
  },
  {
    type: 'notes',
    label: 'General Research Notes',
    description: 'Freeform notes, meeting summaries & brain dumps',
    icon: FileText,
  },
  {
    type: 'custom',
    label: 'Custom Section',
    description: 'Create any custom section with your own title',
    icon: FolderPlus,
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { addSection } = useResearchStore();

  const [selectedType, setSelectedType] = useState<ResearchSectionType>('literature_review');
  const [title, setTitle] = useState('Literature Review');
  const [description, setDescription] = useState('');

  const handleSelectType = (option: (typeof SECTION_TYPE_OPTIONS)[0]) => {
    setSelectedType(option.type);
    setTitle(option.label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addSection(projectId, {
      type: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Research Section" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Select Section Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SECTION_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedType === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => handleSelectType(opt)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {opt.label}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Section Title *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Primary Literature Review"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of what this section covers..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs">
            Add Section
          </button>
        </div>
      </form>
    </Modal>
  );
};
