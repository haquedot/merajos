'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  ChevronRight,
  FlaskConical,
  Star,
  FileText,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { ResearchProject, ResearchStatus } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { GridCardsSkeleton } from '../../components/ui/Skeleton';

// ─── New Project Modal ────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
];

function NewProjectModal({
  isOpen,
  onClose,
  editProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  editProject?: ResearchProject | null;
}) {
  const { addProject, updateProject } = useResearchStore();

  const [title, setTitle] = useState(editProject?.title ?? '');
  const [description, setDescription] = useState(editProject?.description ?? '');
  const [field, setField] = useState(editProject?.field ?? '');
  const [status, setStatus] = useState<ResearchStatus>(editProject?.status ?? 'active');
  const [color, setColor] = useState(editProject?.color ?? ACCENT_COLORS[0]);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(editProject?.title ?? '');
      setDescription(editProject?.description ?? '');
      setField(editProject?.field ?? '');
      setStatus(editProject?.status ?? 'active');
      setColor(editProject?.color ?? ACCENT_COLORS[0]);
    }
  }, [isOpen, editProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editProject) {
      await updateProject(editProject.id, { title: title.trim(), description, field, status, color });
    } else {
      await addProject({ title: title.trim(), description, field, status, color });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editProject ? 'Edit Research Project' : 'New Research Project'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Project Title *
          </label>
          <input
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Federated Learning in Healthcare"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Field / Domain
            </label>
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. Machine Learning"
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ResearchStatus)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this research project..."
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Accent Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
            {editProject ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ResearchStatus, { variant: 'success' | 'primary' | 'warning' | 'secondary'; label: string }> = {
  active: { variant: 'primary', label: 'Active' },
  paused: { variant: 'warning', label: 'Paused' },
  completed: { variant: 'success', label: 'Completed' },
  archived: { variant: 'secondary', label: 'Archived' },
};

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ResearchProject;
  onEdit: (p: ResearchProject) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const allPapers = project.sections.flatMap((s) => s.papers ?? []);
  const importantPapers = allPapers.filter((p) => p.isImportant).length;
  const statusInfo = STATUS_BADGE[project.status];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col"
    >
      {/* Color accent strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color ?? '#3b82f6' }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug truncate">
              {project.title}
            </h3>
            {project.field && (
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {project.field}
              </span>
            )}
          </div>
          <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
        </div>

        {project.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <FileText className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
            <span className="text-xs font-black text-gray-900 dark:text-white block">{allPapers.length}</span>
            <span className="text-[9px] text-gray-400 font-semibold uppercase">Papers</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <Star className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
            <span className="text-xs font-black text-gray-900 dark:text-white block">{importantPapers}</span>
            <span className="text-[9px] text-gray-400 font-semibold uppercase">Key</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <FolderOpen className="w-3.5 h-3.5 text-purple-500 mx-auto mb-0.5" />
            <span className="text-xs font-black text-gray-900 dark:text-white block">{project.sections.length}</span>
            <span className="text-[9px] text-gray-400 font-semibold uppercase">Sections</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{project.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: project.color ?? '#3b82f6' }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => router.push(`/research/${project.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{ backgroundColor: project.color ?? '#3b82f6' }}
          >
            Open <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  const { projects, isLoading, deleteProject } = useResearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<ResearchProject | null>(null);

  if (isLoading) return <GridCardsSkeleton count={6} />;

  const activeCount = projects.filter((p) => p.status === 'active').length;

  const handleEdit = (p: ResearchProject) => {
    setEditProject(p);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditProject(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FlaskConical}
        iconBgColor="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        title="Research Projects"
        badgeText={`${projects.length} Projects`}
        badgeVariant="purple"
        subtitle={`${activeCount} active · Manage your research, literature, and writing progress`}
        actions={
          <button
            onClick={() => { setEditProject(null); setIsModalOpen(true); }}
            className="btn-primary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No research projects yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              Create your first research project to start managing papers, sections, and writing progress.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editProject={editProject}
      />
    </div>
  );
}
