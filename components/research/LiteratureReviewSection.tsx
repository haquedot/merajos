'use client';

import React, { useState } from 'react';
import { Search, Plus, Star, BookOpen, Filter } from 'lucide-react';
import { ResearchSection, ResearchPaper, PaperStatus } from '../../types';
import { PaperCard } from './PaperCard';
import { AddPaperModal } from './AddPaperModal';

interface LiteratureReviewSectionProps {
  section: ResearchSection;
  projectId: string;
}

export const LiteratureReviewSection: React.FC<LiteratureReviewSectionProps> = ({
  section,
  projectId,
}) => {
  const papers = section.papers ?? [];

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaperStatus | 'all'>('all');
  const [importantOnly, setImportantOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPaper, setEditPaper] = useState<ResearchPaper | null>(null);

  const filteredPapers = papers.filter((paper) => {
    if (importantOnly && !paper.isImportant) return false;
    if (statusFilter !== 'all' && paper.status !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchAuthors = paper.authors?.toLowerCase().includes(q);
      const matchSource = paper.source?.toLowerCase().includes(q);
      const matchTags = paper.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchAuthors || matchSource || matchTags;
    }
    return true;
  });

  const handleEdit = (paper: ResearchPaper) => {
    setEditPaper(paper);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditPaper(null);
  };

  return (
    <div className="space-y-4">
      {/* Section Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by title, author, source, tag..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setImportantOnly(!importantOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              importantOnly
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${importantOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            Key Papers
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaperStatus | 'all')}
            className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="reading">Reading</option>
            <option value="skimmed">Skimmed</option>
            <option value="cited">Cited</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={() => {
              setEditPaper(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Paper
          </button>
        </div>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">No papers found</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {query || statusFilter !== 'all' || importantOnly
                ? 'Try adjusting your search filters.'
                : 'Click "Add Paper" to start adding literature to this section.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              projectId={projectId}
              sectionId={section.id}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddPaperModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        projectId={projectId}
        sectionId={section.id}
        editPaper={editPaper}
      />
    </div>
  );
};
