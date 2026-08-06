'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  Kanban,
  ListCheck,
  TrendingUp,
  Bug,
  Sparkles,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Badge } from '../../components/ui/Badge';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { SVGBarChart, SVGDonutChart } from '../../components/ui/SVGCharts';
import { Modal } from '../../components/ui/Modal';

export default function ClientsPage() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    toggleFeature,
    addFeature,
    addBug,
    updateBugStatus,
    addProject,
  } = useProjectStore();

  const { tasks } = useTaskStore();

  const [newFeatureText, setNewFeatureText] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);

  // New Project Form
  const [projName, setProjName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projEstHours, setProjEstHours] = useState(80);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim() || !activeProject) return;
    addFeature(activeProject.id, newFeatureText.trim());
    setNewFeatureText('');
  };

  const handleAddBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !activeProject) return;
    addBug(activeProject.id, {
      title: bugTitle.trim(),
      severity: bugSeverity,
      status: 'open',
    });
    setBugTitle('');
    setIsBugModalOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    addProject({
      name: projName.trim(),
      clientName: clientName.trim() || 'Internal Client',
      description: projDesc.trim(),
      status: 'active',
      progress: 0,
      estimatedHours: Number(projEstHours) || 50,
      actualHours: 0,
      deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      features: [],
      bugs: [],
      techStack: ['Next.js 15', 'TypeScript', 'TailwindCSS'],
    });

    setProjName('');
    setIsProjModalOpen(false);
  };

  if (!activeProject) return null;

  return (
    <div className="space-y-6">
      {/* Client Header & Project Tabs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Client Projects Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Track deliverables, feature scope, bug reports, and time spent on client builds
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProjModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            New Client Project
          </button>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          {projects.map((p) => {
            const isSelected = p.id === activeProject.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>{p.name}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/20">
                  {p.progress}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Project Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                {activeProject.clientName}
              </span>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                {activeProject.name}
              </h2>
              <p className="text-xs text-gray-500 mt-1">{activeProject.description}</p>
            </div>
            <Badge variant="success" size="md">
              {activeProject.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {activeProject.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Deadline</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {activeProject.deadline}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Est. vs Spent</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {activeProject.actualHours}h / {activeProject.estimatedHours}h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Open Bugs</span>
              <span className="text-sm font-extrabold text-rose-500">
                {activeProject.bugs.filter((b) => b.status !== 'resolved').length} Bugs
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress Widget */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <CircularProgress
            percentage={activeProject.progress}
            size={130}
            strokeWidth={12}
            color="#8b5cf6"
            label="Completion"
          />
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Project Health: Great
            </h4>
            <p className="text-xs text-gray-400">
              {activeProject.features.filter((f) => f.completed).length} of {activeProject.features.length} features shipped
            </p>
          </div>
        </div>
      </div>

      {/* Features & Scope checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListCheck className="w-5 h-5 text-purple-500" />
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Feature Roadmap & Scope
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {activeProject.features.filter((f) => f.completed).length}/{activeProject.features.length} Done
            </span>
          </div>

          <form onSubmit={handleAddFeature} className="flex gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Add new feature requirement..."
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
            >
              Add
            </button>
          </form>

          <div className="space-y-2">
            {activeProject.features.map((f) => (
              <div
                key={f.id}
                onClick={() => toggleFeature(activeProject.id, f.id)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      f.completed ? 'bg-purple-600 text-white' : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {f.completed && '✓'}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      f.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {f.title}
                  </span>
                </div>
                <Badge variant={f.completed ? 'success' : 'outline'} size="sm">
                  {f.completed ? 'Shipped' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Bug Tracker List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Bug Tracker & Issues
              </h3>
            </div>
            <button
              onClick={() => setIsBugModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100"
            >
              + Report Bug
            </button>
          </div>

          <div className="space-y-2">
            {activeProject.bugs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No bugs reported for this project!</p>
            ) : (
              activeProject.bugs.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {b.title}
                    </span>
                    <Badge variant={b.severity === 'high' || b.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                      {b.severity} severity
                    </Badge>
                  </div>

                  <select
                    value={b.status}
                    onChange={(e) => updateBugStatus(activeProject.id, b.id, e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bug Modal */}
      <Modal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} title="Report Bug for Project">
        <form onSubmit={handleAddBug} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bug Description *
            </label>
            <input
              type="text"
              required
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              placeholder="e.g. CORS policy mismatch on payment POST"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              value={bugSeverity}
              onChange={(e) => setBugSeverity(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsBugModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              Submit Bug
            </button>
          </div>
        </form>
      </Modal>

      {/* New Project Modal */}
      <Modal isOpen={isProjModalOpen} onClose={() => setIsProjModalOpen(false)} title="Create Client Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              placeholder="e.g. Masarat Client App"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Acme Retail Solutions"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsProjModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
