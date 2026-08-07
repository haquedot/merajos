'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Search, CheckSquare, Briefcase, BookOpen, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useResearchStore } from '../../store/useResearchStore';
import { useCareerStore } from '../../store/useCareerStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { notes } = useNotesStore();
  const { papers } = useResearchStore();
  const { jobs } = useCareerStore();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredTasks = query
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : tasks.slice(0, 3);

  const filteredProjects = query
    ? projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : projects.slice(0, 2);

  const filteredNotes = query
    ? notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()))
    : notes.slice(0, 2);

  const filteredPapers = query
    ? papers.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : papers.slice(0, 2);

  const filteredJobs = query
    ? jobs.filter((j) => j.company.toLowerCase().includes(query.toLowerCase()) || j.role.toLowerCase().includes(query.toLowerCase()))
    : jobs.slice(0, 2);

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Input header */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, notes, research papers, job apps..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Results listing */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Tasks section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigateTo('/tasks')}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {t.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects section */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                Client Projects
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateTo('/clients')}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{p.clientName}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Notes
              </div>
              <div className="space-y-1">
                {filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => navigateTo('/notes')}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {n.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research section */}
          {filteredPapers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                Research Papers
              </div>
              <div className="space-y-1">
                {filteredPapers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateTo('/research')}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {p.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career & Jobs section */}
          {filteredJobs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <GraduationCap className="w-3.5 h-3.5 text-rose-500" />
                Job Applications
              </div>
              <div className="space-y-1">
                {filteredJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => navigateTo('/career')}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {j.company} - {j.role}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
