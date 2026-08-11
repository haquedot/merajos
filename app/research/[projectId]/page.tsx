'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  PenTool,
  Database,
  Cpu,
  Image,
  FileText,
  Trash2,
  FlaskConical,
  Star,
  FolderPlus,
} from 'lucide-react';
import { useResearchStore } from '../../../store/useResearchStore';
import { ResearchProject, ResearchSection, ResearchSectionType } from '../../../types';
import { AddSectionModal } from '../../../components/research/AddSectionModal';
import { LiteratureReviewSection } from '../../../components/research/LiteratureReviewSection';
import { WritingProgressSection } from '../../../components/research/WritingProgressSection';
import { GenericSection } from '../../../components/research/GenericSection';
import { Badge } from '../../../components/ui/Badge';
import { GridCardsSkeleton } from '../../../components/ui/Skeleton';

const SECTION_ICON_MAP: Record<ResearchSectionType, any> = {
  literature_review: BookOpen,
  writing: PenTool,
  datasets: Database,
  algorithms: Cpu,
  diagrams: Image,
  notes: FileText,
  custom: FlaskConical,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { projects, isLoading, deleteSection, setActiveProject } = useResearchStore();

  const project = projects.find((p: ResearchProject) => p.id === projectId);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [projectId, setActiveProject]);

  useEffect(() => {
    if (project && project.sections.length > 0 && !activeSectionId) {
      setActiveSectionId(project.sections[0].id);
    }
  }, [project, activeSectionId]);

  if (isLoading) {
    return <GridCardsSkeleton count={3} />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <FlaskConical className="w-12 h-12 text-gray-400" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Research project not found
        </h3>
        <button
          onClick={() => router.push('/research')}
          className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research
        </button>
      </div>
    );
  }

  const activeSection = project.sections.find((s: ResearchSection) => s.id === activeSectionId) || project.sections[0];
  const allPapers = project.sections.flatMap((s: ResearchSection) => s.papers ?? []);
  const keyPapers = allPapers.filter((p) => p.isImportant).length;

  const handleDeleteSection = async (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.sections.length <= 1) {
      alert('You cannot delete the last remaining section in a project.');
      return;
    }
    if (confirm('Are you sure you want to delete this section and its data?')) {
      await deleteSection(project.id, secId);
      if (activeSectionId === secId) {
        const remaining = project.sections.filter((s: ResearchSection) => s.id !== secId);
        setActiveSectionId(remaining[0]?.id ?? null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/research')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>

          <Badge variant="primary" size="sm">
            {project.status.toUpperCase()}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color ?? '#3b82f6' }}
              />
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
                {project.title}
              </h1>
            </div>
            {project.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                {allPapers.length}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Papers</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-center border border-amber-100 dark:border-amber-900">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                {keyPapers}
              </span>
              <span className="text-[9px] font-bold text-amber-500 uppercase">Key ⭐</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                {project.sections.length}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-800">
        {project.sections.map((section: ResearchSection) => {
          const Icon = SECTION_ICON_MAP[section.type] || FolderPlus;
          const isActive = section.id === activeSection?.id;
          const paperCount = section.papers?.length ?? 0;

          return (
            <div
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{section.title}</span>
              {section.type === 'literature_review' && paperCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {paperCount}
                </span>
              )}

              {project.sections.length > 1 && (
                <button
                  onClick={(e) => handleDeleteSection(section.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-rose-300 transition-opacity ml-1 ${
                    isActive ? 'text-white/70' : 'text-gray-400'
                  }`}
                  title="Delete Section"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setIsAddSectionModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {/* Active Section Body */}
      {activeSection && (
        <div className="pt-2">
          {activeSection.type === 'literature_review' && (
            <LiteratureReviewSection section={activeSection} projectId={project.id} />
          )}

          {activeSection.type === 'writing' && (
            <WritingProgressSection section={activeSection} projectId={project.id} />
          )}

          {[
            'datasets',
            'algorithms',
            'diagrams',
            'notes',
            'custom',
          ].includes(activeSection.type) && (
            <GenericSection section={activeSection} projectId={project.id} />
          )}
        </div>
      )}

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        projectId={project.id}
      />
    </div>
  );
}
