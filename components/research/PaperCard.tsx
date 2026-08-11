'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { ResearchPaper, PaperStatus } from '../../types';
import { useResearchStore } from '../../store/useResearchStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Badge } from '../ui/Badge';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface PaperCardProps {
  paper: ResearchPaper;
  projectId: string;
  sectionId: string;
  onEdit: (paper: ResearchPaper) => void;
}

const STATUS_CONFIG: Record<
  PaperStatus,
  { variant: 'secondary' | 'primary' | 'success' | 'warning' | 'info'; label: string }
> = {
  unread: { variant: 'secondary', label: 'Unread' },
  reading: { variant: 'primary', label: 'Reading' },
  skimmed: { variant: 'info', label: 'Skimmed' },
  cited: { variant: 'success', label: 'Cited' },
  archived: { variant: 'warning', label: 'Archived' },
};

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  projectId,
  sectionId,
  onEdit,
}) => {
  const { togglePaperImportant, updatePaper, deletePaper } = useResearchStore();
  const { addTask } = useTaskStore();

  const [expanded, setExpanded] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const statusInfo = STATUS_CONFIG[paper.status] || STATUS_CONFIG.unread;

  const handleCopyCitation = () => {
    const textToCopy = paper.citation || `${paper.authors} (${paper.year}). ${paper.title}. ${paper.source}.`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopyToTask = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await addTask({
      title: `Read Paper: ${paper.title}`,
      category: 'Research',
      priority: paper.isImportant ? 'high' : 'medium',
      description: `Authors: ${paper.authors} (${paper.year})\nSource: ${paper.source}\n\nSummary:\n${paper.summary || 'No summary provided.'}\n\nPDF: ${paper.pdfUrl || 'N/A'}`,
      dueDate: todayStr,
      status: 'todo',
      estimatedHours: 1,
      actualHours: 0,
      recurring: 'none',
      tags: paper.tags || ['Research'],
      mit: paper.isImportant,
    });
    setTaskAdded(true);
    setTimeout(() => setTaskAdded(false), 2500);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`p-4 rounded-2xl border transition-all ${paper.isImportant
          ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xs'
          }`}
      >
        {/* Top Header */}
        <div className="flex flex-col items-start justify-between gap-3">
          <div className="w-full flex items-start justify-between gap-2.5 min-w-0">
            <button
              onClick={() => togglePaperImportant(projectId, sectionId, paper.id)}
              className={`p-1 rounded-lg transition-transform active:scale-125 mt-0.5 ${paper.isImportant
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
                }`}
              title={paper.isImportant ? 'Marked as key paper' : 'Mark as key paper'}
            >
              <Star className="w-4 h-4" />
            </button>

            {/* Status Dropdown / Badge */}
            <select
              value={paper.status}
              onChange={(e) =>
                updatePaper(projectId, sectionId, paper.id, {
                  status: e.target.value as PaperStatus,
                })
              }
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="unread">Unread</option>
              <option value="reading">Reading</option>
              <option value="skimmed">Skimmed</option>
              <option value="cited">Cited</option>
              <option value="archived">Archived</option>
            </select>

          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
              {paper.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {paper.authors && <span>{paper.authors}</span>}
              {paper.year && <span>• {paper.year}</span>}
              {paper.source && (
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                  {paper.source}
                </span>
              )}
              {paper.readingTimeMinutes > 0 && (
                <span>• {paper.readingTimeMinutes} min read</span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Summary preview or accordion */}
        {(paper.summary || paper.notes) && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? (
                <>
                  Hide Notes & Summary <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  View Notes & Summary <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800"
                >
                  {paper.summary && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                        Summary
                      </span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        {paper.summary}
                      </p>
                    </div>
                  )}
                  {paper.notes && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                        Key Takeaways & Notes
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        {paper.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-blue-500" /> PDF
              </a>
            )}

            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Cite
                </>
              )}
            </button>

            <button
              onClick={handleCopyToTask}
              disabled={taskAdded}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold transition-colors disabled:opacity-80"
            >
              {taskAdded ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" /> Task Added!
                </>
              ) : (
                <>
                  <CheckSquare className="w-3 h-3" /> Copy to Task
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(paper)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Edit Paper"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete Paper"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deletePaper(projectId, sectionId, paper.id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete Research Paper"
        message="Are you sure you want to delete this research paper?"
      />

    </>
  );
};
