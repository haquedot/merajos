'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Clock,
  ExternalLink,
  Award,
  Bookmark,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { Paper, PaperStatus, Priority } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';

export default function ResearchPage() {
  const {
    overview,
    papers,
    writingSections,
    searchQuery,
    selectedStatusFilter,
    updateOverview,
    addPaper,
    updatePaper,
    updateWritingSection,
    setSearchQuery,
    setSelectedStatusFilter,
  } = useResearchStore();

  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  // New paper form states
  const [paperTitle, setPaperTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(2025);
  const [source, setSource] = useState('ArXiv / Conference');
  const [notes, setNotes] = useState('');
  const [citation, setCitation] = useState('');
  const [status, setStatus] = useState<PaperStatus>('reading');
  const [priority, setPriority] = useState<Priority>('high');
  const [pdfUrl, setPdfUrl] = useState('');

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'all' || p.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;

    addPaper({
      title: paperTitle.trim(),
      authors: authors.trim() || 'Anonymous',
      year: Number(year) || 2025,
      source: source.trim(),
      notes: notes.trim(),
      citation: citation.trim(),
      status,
      priority,
      tags: ['Thesis', 'AI'],
      pdfUrl: pdfUrl.trim() || undefined,
      readingTimeMinutes: 30,
    });

    setPaperTitle('');
    setIsPaperModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <PageHeader
        icon={BookOpen}
        iconBgColor="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        title="Research & Thesis Dashboard"
        badgeText={`${papers.length} Papers`}
        badgeVariant="blue"
        subtitle="Track literature review, paper drafting progress, and reference citation database"
        actions={
          <button
            onClick={() => setIsPaperModalOpen(true)}
            className="btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Paper</span>
          </button>
        }
      >
        {/* Current Active Topic Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="min-w-0 w-full md:w-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">
              Thesis Topic
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 leading-snug">
              {overview.thesisTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">{overview.topic}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-gray-700/60">
            <div className="text-left md:text-center p-2 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 md:border-none md:bg-transparent">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Papers Read</span>
              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                {overview.papersRead} Papers
              </span>
            </div>
            <div className="text-left md:text-center p-2 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 md:border-none md:bg-transparent">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Hours Spent</span>
              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                {overview.hoursSpent} Hours
              </span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Thesis Writing Breakdown */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
              Paper Writing Progress by Section
            </h3>
            <span className="text-xs font-bold text-blue-500 shrink-0">
              {overview.writingProgress}% Overall Written
            </span>
          </div>

          <div className="space-y-3">
            {writingSections.map((sec) => {
              const perc = Math.round((sec.currentWords / sec.targetWords) * 100);
              return (
                <div
                  key={sec.id}
                  className="p-3 sm:p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {sec.section}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {sec.currentWords} / {sec.targetWords} words ({perc}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${perc}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Ring Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
          <CircularProgress
            percentage={overview.progress}
            size={130}
            strokeWidth={12}
            color="#3b82f6"
            label="Thesis Readiness"
          />
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
              Target Submission Date
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">December 2026 Camera Ready</p>
          </div>
        </div>
      </div>

      {/* Reference Database Section */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500 shrink-0" />
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
              Literature Review & Reference Database
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paper titles, authors..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="cited">Cited</option>
              <option value="reading">Reading</option>
              <option value="unread">Unread</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredPapers.map((paper) => (
            <motion.div
              key={paper.id}
              whileHover={{ y: -2 }}
              className="p-3.5 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5 sm:space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white block truncate">
                    {paper.title}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5 block truncate">
                    {paper.authors} ({paper.year}) • {paper.source}
                  </span>
                </div>
                <Badge variant={paper.status === 'cited' ? 'success' : 'purple'} size="sm">
                  {paper.status}
                </Badge>
              </div>

              {paper.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 italic">
                  "{paper.notes}"
                </p>
              )}

              <div className="flex items-center justify-between pt-2 text-[10px] text-gray-400 border-t border-gray-200/60 dark:border-gray-800">
                <span className="font-mono truncate">Citation: {paper.citation || 'Ref'}</span>
                {paper.pdfUrl && (
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1 font-bold shrink-0"
                  >
                    View PDF <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Paper Modal */}
      <Modal isOpen={isPaperModalOpen} onClose={() => setIsPaperModalOpen(false)} title="Add Research Paper">
        <form onSubmit={handleAddPaper} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Paper Title *
            </label>
            <input
              type="text"
              required
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="e.g. FlashAttention-3: Ultra Fast Attention"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Authors
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Tri Dao et al."
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Key Notes & Insights
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down the main mathematical concept or takeaway..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaperStatus)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="reading">Reading</option>
                <option value="cited">Cited</option>
                <option value="unread">Unread</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                PDF Link (Optional)
              </label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://arxiv.org/..."
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Save Paper
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
