'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { ResearchPaper, PaperStatus } from '../../types';
import { useResearchStore } from '../../store/useResearchStore';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  sectionId: string;
  editPaper?: ResearchPaper | null;
}

export const AddPaperModal: React.FC<AddPaperModalProps> = ({
  isOpen,
  onClose,
  projectId,
  sectionId,
  editPaper,
}) => {
  const { addPaper, updatePaper } = useResearchStore();

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [source, setSource] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [status, setStatus] = useState<PaperStatus>('unread');
  const [isImportant, setIsImportant] = useState(false);
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [citation, setCitation] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(15);

  useEffect(() => {
    if (isOpen) {
      if (editPaper) {
        setTitle(editPaper.title ?? '');
        setAuthors(editPaper.authors ?? '');
        setYear(editPaper.year ?? new Date().getFullYear());
        setSource(editPaper.source ?? '');
        setPdfUrl(editPaper.pdfUrl ?? '');
        setDoi(editPaper.doi ?? '');
        setStatus(editPaper.status ?? 'unread');
        setIsImportant(editPaper.isImportant ?? false);
        setSummary(editPaper.summary ?? '');
        setNotes(editPaper.notes ?? '');
        setCitation(editPaper.citation ?? '');
        setTagsInput((editPaper.tags ?? []).join(', '));
        setReadingTimeMinutes(editPaper.readingTimeMinutes ?? 15);
      } else {
        setTitle('');
        setAuthors('');
        setYear(new Date().getFullYear());
        setSource('');
        setPdfUrl('');
        setDoi('');
        setStatus('unread');
        setIsImportant(false);
        setSummary('');
        setNotes('');
        setCitation('');
        setTagsInput('');
        setReadingTimeMinutes(15);
      }
    }
  }, [isOpen, editPaper]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editPaper) {
      await updatePaper(projectId, sectionId, editPaper.id, {
        title: title.trim(),
        authors: authors.trim(),
        year: Number(year),
        source: source.trim(),
        pdfUrl: pdfUrl.trim() || undefined,
        doi: doi.trim() || undefined,
        status,
        isImportant,
        summary: summary.trim(),
        notes: notes.trim(),
        citation: citation.trim(),
        tags,
        readingTimeMinutes: Number(readingTimeMinutes),
      });
    } else {
      await addPaper(projectId, sectionId, {
        title: title.trim(),
        authors: authors.trim(),
        year: Number(year),
        source: source.trim(),
        pdfUrl: pdfUrl.trim() || undefined,
        doi: doi.trim() || undefined,
        status,
        isImportant,
        summary: summary.trim(),
        notes: notes.trim(),
        citation: citation.trim(),
        tags,
        readingTimeMinutes: Number(readingTimeMinutes),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editPaper ? 'Edit Research Paper' : 'Add Research Paper'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Paper Title *
          </label>
          <input
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Attention Is All You Need"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Authors
            </label>
            <input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Vaswani et al."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Year Published
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Source / Conference
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. NeurIPS, ArXiv, IEEE"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaperStatus)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unread">Unread</option>
              <option value="reading">Reading</option>
              <option value="skimmed">Skimmed</option>
              <option value="cited">Cited</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              PDF Link (URL)
            </label>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://arxiv.org/pdf/..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Reading Time (Minutes)
            </label>
            <input
              type="number"
              value={readingTimeMinutes}
              onChange={(e) => setReadingTimeMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Summary / Core Thesis
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Key findings and contributions of this paper..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Notes / Detailed Takeaways
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bullet points, formulas, ideas to cite..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Formatted Citation String
            </label>
            <input
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="e.g. Vaswani, A., et al. (2017). Attention..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="transformer, nlp, attention"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isImportant"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <label htmlFor="isImportant" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
            ⭐ Mark as Key / High Priority Paper
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs">
            {editPaper ? 'Save Changes' : 'Add Paper'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
