'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  Code2,
  TrendingUp,
  Bug,
  Calendar as CalendarIcon,
  DollarSign,
  Edit,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  Users,
  AlertCircle,
  FileCheck,
  Building2,
  Mail,
  Phone,
  Layers,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { Project } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { Button } from '../../components/ui/button';
import { getProjectTheme, PROJECT_COLOR_MAP, ProjectColorKey } from '../../lib/projectTheme';

const COLOR_OPTIONS = Object.values(PROJECT_COLOR_MAP);

export default function ClientsPage() {
  const { projects, loadFromDB, addProject, updateProject, deleteProject } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold' | 'archived'>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    status: 'active' as Project['status'],
    budget: 0,
    amountPaid: 0,
    currency: '$',
    estimatedHours: 40,
    deadline: '',
    color: 'indigo' as string,
    techStack: 'Next.js, TypeScript, TailwindCSS',
  });

  useEffect(() => {
    loadFromDB();
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalPaid = projects.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  const totalOpenBugs = projects.reduce(
    (acc, p) => acc + (p.bugs ? p.bugs.filter((b) => b.status !== 'resolved').length : 0),
    0
  );

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: '',
      status: 'active',
      budget: 1500,
      amountPaid: 500,
      currency: '$',
      estimatedHours: 40,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].name,
      techStack: 'Next.js, TypeScript, TailwindCSS',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    const theme = getProjectTheme(proj.color);
    setFormData({
      name: proj.name,
      clientName: proj.clientName,
      clientEmail: proj.clientEmail || '',
      clientPhone: proj.clientPhone || '',
      description: proj.description,
      status: proj.status,
      budget: proj.budget || 0,
      amountPaid: proj.amountPaid || 0,
      currency: proj.currency || '$',
      estimatedHours: proj.estimatedHours || 0,
      deadline: proj.deadline || '',
      color: theme.name,
      techStack: proj.techStack ? proj.techStack.join(', ') : '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const techArray = formData.techStack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProject) {
      await updateProject(editingProject.id, {
        name: formData.name.trim(),
        clientName: formData.clientName.trim() || 'Client Workspace',
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone.trim(),
        description: formData.description.trim(),
        status: formData.status,
        budget: Number(formData.budget) || 0,
        amountPaid: Number(formData.amountPaid) || 0,
        currency: formData.currency || '$',
        estimatedHours: Number(formData.estimatedHours) || 0,
        deadline: formData.deadline,
        color: formData.color,
        techStack: techArray.length > 0 ? techArray : ['Next.js', 'TypeScript'],
      });
    } else {
      await addProject({
        name: formData.name.trim(),
        clientName: formData.clientName.trim() || 'Client Workspace',
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone.trim(),
        description: formData.description.trim(),
        status: formData.status,
        progress: 0,
        budget: Number(formData.budget) || 0,
        amountPaid: Number(formData.amountPaid) || 0,
        currency: formData.currency || '$',
        estimatedHours: Number(formData.estimatedHours) || 40,
        actualHours: 0,
        deadline: formData.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        color: formData.color,
        features: [],
        bugs: [],
        invoices: [],
        techStack: techArray.length > 0 ? techArray : ['Next.js', 'TypeScript'],
      });
    }

    setIsCreateModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    await deleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        iconBgColor="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
        title="Client Projects & Work Hub"
        badgeText={`${projects.length} Projects`}
        badgeVariant="purple"
        subtitle="Manage client deliverables, features, bug tracking, and invoicing in dedicated workspaces"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Client Project</span>
          </button>
        }
      />

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Active Clients</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{activeCount}</div>
            <span className="text-[11px] text-gray-500">{completedCount} Completed</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Invoiced</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              ${totalBudget.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ${totalPaid.toLocaleString()} Paid
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Features Logged</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {projects.reduce((acc, p) => acc + (p.features ? p.features.length : 0), 0)}
            </div>
            <span className="text-[11px] text-gray-500">Across all projects</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Open Issues</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{totalOpenBugs}</div>
            <span className="text-[11px] text-gray-500">Requires attention</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Bug className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {(['all', 'active', 'completed', 'on_hold', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-orbit-blue text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Client Projects Gallery Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
          <Briefcase className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200">No Client Projects Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No projects match your current filters. Try resetting search or filters!'
              : 'Create your first client project workspace to track deliverables, features, bugs, and invoices.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Client Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const completedFeatures = project.features ? project.features.filter((f) => f.completed).length : 0;
            const totalFeatures = project.features ? project.features.length : 0;
            const openBugs = project.bugs ? project.bugs.filter((b) => b.status !== 'resolved').length : 0;
            const theme = getProjectTheme(project.color);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div className={`h-2 w-full ${theme.bg}`} />

                <div className="p-5 space-y-4">
                  {/* Title & Client Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                        {project.clientName || 'Client Workspace'}
                      </span>
                      <h3 className={`text-base font-black truncate mt-0.5 transition-colors ${theme.text}`}>
                        {project.name}
                      </h3>
                    </div>
                    <Badge
                      variant={
                        project.status === 'completed'
                          ? 'success'
                          : project.status === 'on_hold'
                          ? 'warning'
                          : project.status === 'archived'
                          ? 'outline'
                          : theme.badgeVariant
                      }
                      size="sm"
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
                    {project.description || 'No description specified for this client project.'}
                  </p>

                  {/* Tech Stack Pills */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-400">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Feature Completion Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Deliverables & Features</span>
                      <span className={`font-extrabold ${theme.text}`}>
                        {project.progress}% ({completedFeatures}/{totalFeatures})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.bg}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial & Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Budget / Paid</span>
                      <span className="font-black text-gray-900 dark:text-white">
                        {project.currency || '$'}{project.amountPaid || 0} / {project.currency || '$'}{project.budget || 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Open Bugs</span>
                      <span className={`font-black ${openBugs > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {openBugs} Issues
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 bg-gray-50/60 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditModal(project, e)}
                      className="p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(project);
                      }}
                      className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    href={`/clients/${project.id}`}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs hover:gap-2 transition-all text-white ${theme.bg} ${theme.bgHover}`}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProject ? 'Edit Client Project' : 'Create New Client Project'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Project Name *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Health Platform App"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Client / Company Name
              </label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. WhatBytes Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Client Email
              </label>
              <Input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="client@company.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Client Phone
              </label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Project Description & Scope
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of deliverables, goals, and key client milestones..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orbit-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as any })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Total Budget ($)</label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount Paid ($)</label>
              <Input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Target Deadline</label>
              <DatePicker
                value={formData.deadline}
                onChange={(val) => setFormData({ ...formData, deadline: val })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Tech Stack (comma separated)</label>
              <Input
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="Next.js, TypeScript, TailwindCSS"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Project Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: t.name })}
                  className={`w-7 h-7 rounded-full transition-transform ${t.bg} ${
                    formData.color === t.name ? 'scale-110 ring-2 ring-offset-2 ' + t.ring : 'hover:scale-105'
                  }`}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary px-4 py-2 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-xs">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated features, bugs, and invoices will be permanently removed.`}
      />
    </div>
  );
}
