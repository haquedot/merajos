'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Layers,
  Bug,
  ListCheck,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Save,
  CheckSquare,
  Receipt,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useProjectStore } from '../../../store/useProjectStore';
import { useTaskStore } from '../../../store/useTaskStore';
import { ProjectFeature, ProjectBug, ProjectInvoice, Project } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { CircularProgress } from '../../../components/ui/CircularProgress';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../../components/modals/ConfirmDeleteModal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { getProjectTheme } from '../../../lib/projectTheme';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.clientId as string;

  const {
    projects,
    loadFromDB,
    updateProject,
    deleteProject,
    addFeature,
    toggleFeature,
    deleteFeature,
    addBug,
    updateBugStatus,
    deleteBug,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    saveProjectNotes,
  } = useProjectStore();

  const { addTask } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'bugs' | 'invoices' | 'notes'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeaturePriority, setNewFeaturePriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState<number | ''>('');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  useEffect(() => {
    loadFromDB();
  }, []);

  const project = projects.find((p) => p.id === clientId);
  const theme = getProjectTheme(project?.color);

  useEffect(() => {
    if (project) {
      setNotesText(project.notes || '');
    }
  }, [project?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!project) {
    return (
      <div className="p-12 text-center space-y-4">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-black text-gray-800 dark:text-gray-200">Client Project Not Found</h2>
        <p className="text-xs text-gray-500">The client workspace you are looking for does not exist or was deleted.</p>
        <Link href="/clients" className="btn-primary px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Hub</span>
        </Link>
      </div>
    );
  }

  // Calculate Metrics
  const completedFeatures = project.features ? project.features.filter((f) => f.completed).length : 0;
  const totalFeatures = project.features ? project.features.length : 0;
  const openBugs = project.bugs ? project.bugs.filter((b) => b.status !== 'resolved').length : 0;
  const totalInvoiced = (project.invoices || []).reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = (project.invoices || []).filter((inv) => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);

  // Copy Feature to Task
  const handleCopyFeatureToTask = (feature: ProjectFeature) => {
    addTask({
      title: `Feature: ${feature.title} (${project.name})`,
      category: 'Client',
      priority: feature.priority === 'high' ? 'high' : 'medium',
      status: 'todo',
      tags: ['client', 'feature', project.clientName || 'work'],
      dueDate: project.deadline || new Date().toISOString().split('T')[0],
      estimatedHours: 1,
      actualHours: 0,
      recurring: 'none',
      mit: false,
    });
    showToast(`"Feature: ${feature.title}" copied to Tasks!`);
  };

  // Copy Bug to Task
  const handleCopyBugToTask = (bug: ProjectBug) => {
    addTask({
      title: `Fix Bug: ${bug.title} (${project.name})`,
      category: 'Client',
      priority: bug.severity === 'critical' || bug.severity === 'high' ? 'urgent' : 'high',
      status: 'todo',
      tags: ['client', 'bug', 'urgent'],
      dueDate: new Date().toISOString().split('T')[0],
      estimatedHours: 1,
      actualHours: 0,
      recurring: 'none',
      mit: false,
    });
    showToast(`"Fix Bug: ${bug.title}" copied to Tasks!`);
  };

  // Handlers
  const handleAddFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureTitle.trim()) return;
    await addFeature(project.id, {
      title: newFeatureTitle.trim(),
      completed: false,
      priority: newFeaturePriority,
    });
    setNewFeatureTitle('');
    showToast('New feature deliverable added!');
  };

  const handleAddBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBugTitle.trim()) return;
    await addBug(project.id, {
      title: newBugTitle.trim(),
      severity: newBugSeverity,
      status: 'open',
    });
    setNewBugTitle('');
    setIsBugModalOpen(false);
    showToast('Bug report logged!');
  };

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceNumber.trim() || !newInvoiceAmount) return;
    await addInvoice(project.id, {
      invoiceNumber: newInvoiceNumber.trim(),
      amount: Number(newInvoiceAmount),
      status: 'unpaid',
      dueDate: newInvoiceDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setNewInvoiceNumber('');
    setNewInvoiceAmount('');
    setIsInvoiceModalOpen(false);
    showToast('Invoice created!');
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await saveProjectNotes(project.id, notesText);
    setIsSavingNotes(false);
    showToast('Project notes saved successfully!');
  };

  const handleDeleteProject = async () => {
    await deleteProject(project.id);
    router.push('/clients');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg flex items-center gap-2 ${theme.bg}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Header & Navigation */}
      <div className="space-y-3">
        <Link
          href="/clients"
          className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:${theme.text} text-gray-500`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Hub</span>
        </Link>

        <PageHeader
          icon={Briefcase}
          iconBgColor={theme.bgLight + ' ' + theme.text}
          title={project.name}
          badgeText={project.status.replace('_', ' ')}
          badgeVariant={project.status === 'completed' ? 'emerald' : theme.headerBadgeVariant}
          subtitle={`Client Workspace for ${project.clientName || 'Client Project'}`}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeletingConfirm(true)}
                className="btn-secondary px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Workspace</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Info', icon: Building2 },
          { id: 'features', label: `Deliverables (${totalFeatures})`, icon: Layers },
          { id: 'bugs', label: `Bugs & Issues (${openBugs})`, icon: Bug },
          { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
          { id: 'notes', label: 'Notes & Specs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? `${theme.bg} text-white shadow-md`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Client Info */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider block ${theme.text}`}>
                    Client Details
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                    {project.clientName || 'Client Workspace'}
                  </h3>
                </div>
                <Badge variant={theme.badgeVariant} size="md">
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {project.clientEmail || 'No email specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {project.clientPhone || 'No phone specified'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Description</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {project.description || 'No detailed scope written for this client project.'}
                </p>
              </div>

              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${theme.bgLight} ${theme.text} ${theme.border}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Completion Widget & Financials */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                <CircularProgress
                  percentage={project.progress}
                  size={140}
                  strokeWidth={14}
                  color={theme.hex}
                  label="Deliverables"
                />
                <div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white">
                    Project Completion: {project.progress}%
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {completedFeatures} of {totalFeatures} deliverables shipped
                  </p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Overview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Total Project Budget</span>
                    <span className="font-black text-gray-900 dark:text-white">
                      {project.currency || '$'}{(project.budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Amount Received</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {project.currency || '$'}{(project.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((project.amountPaid || 0) / (project.budget || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURES & DELIVERABLES */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Features & Deliverables Scope</h3>
                <p className="text-xs text-gray-500">
                  Track project feature deliverables and copy them into your Daily Tasks module.
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${theme.bgLight} ${theme.text}`}>
                {completedFeatures}/{totalFeatures} Shipped
              </span>
            </div>

            {/* Add Feature Form */}
            <form onSubmit={handleAddFeatureSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                placeholder="Enter new feature requirement..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
              <select
                value={newFeaturePriority}
                onChange={(e) => setNewFeaturePriority(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white font-semibold"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 text-white transition-colors ${theme.bg} ${theme.bgHover}`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </button>
            </form>

            {/* Feature Cards List */}
            <div className="space-y-3 pt-2">
              {totalFeatures === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No deliverables specified yet.</p>
                  <p className="text-[11px] text-gray-400">Add feature requirements above to track project scope!</p>
                </div>
              ) : (
                project.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 hover:border-purple-200 dark:hover:border-purple-900 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleFeature(project.id, feature.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0 ${
                          feature.completed
                            ? `${theme.bg} text-white`
                            : 'border border-gray-300 dark:border-gray-600 hover:border-purple-500'
                        }`}
                      >
                        {feature.completed && '✓'}
                      </button>
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold block truncate ${
                            feature.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {feature.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={feature.priority === 'high' ? 'danger' : theme.badgeVariant} size="sm">
                        {feature.priority || 'medium'}
                      </Badge>

                      <button
                        onClick={() => handleCopyFeatureToTask(feature)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${theme.bgLight} ${theme.text}`}
                        title="Copy feature to Task module"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy to Task</span>
                      </button>

                      <button
                        onClick={() => deleteFeature(project.id, feature.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUGS & ISSUES */}
      {activeTab === 'bugs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Bug Tracker & Issues</h3>
                <p className="text-xs text-gray-500">Log software bugs, track resolution status, and copy urgent bugs to tasks.</p>
              </div>
              <button
                onClick={() => setIsBugModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white transition-colors ${theme.bg} ${theme.bgHover}`}
              >
                <Bug className="w-4 h-4" />
                <span>Report Bug</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {!project.bugs || project.bugs.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                  <Bug className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No bugs reported!</p>
                  <p className="text-[11px] text-gray-400">Great job! All issues are clear.</p>
                </div>
              ) : (
                project.bugs.map((bug) => (
                  <div
                    key={bug.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{bug.title}</span>
                        <Badge variant={bug.severity === 'critical' || bug.severity === 'high' ? 'danger' : 'warning'} size="sm">
                          {bug.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <select
                        value={bug.status}
                        onChange={(e) => updateBugStatus(project.id, bug.id, e.target.value as any)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      <button
                        onClick={() => handleCopyBugToTask(bug)}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Copy bug to Task module"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy to Task</span>
                      </button>

                      <button
                        onClick={() => deleteBug(project.id, bug.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES & BILLING */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Invoices & Payment Milestones</h3>
                <p className="text-xs text-gray-500">Track client billing, due dates, and paid invoices.</p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white transition-colors ${theme.bg} ${theme.bgHover}`}
              >
                <Receipt className="w-4 h-4" />
                <span>New Invoice</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {!project.invoices || project.invoices.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                  <Receipt className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No invoices logged yet.</p>
                  <p className="text-[11px] text-gray-400">Add an invoice milestone to track payments!</p>
                </div>
              ) : (
                project.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                          Invoice #{inv.invoiceNumber}
                        </span>
                        <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'} size="sm">
                          {inv.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-gray-400 block">Due Date: {inv.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-gray-900 dark:text-white">
                        {project.currency || '$'}{inv.amount.toLocaleString()}
                      </span>

                      <button
                        onClick={() => updateInvoiceStatus(project.id, inv.id, inv.status === 'paid' ? 'unpaid' : 'paid')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : `${theme.bg} text-white ${theme.bgHover}`
                        }`}
                      >
                        {inv.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>

                      <button
                        onClick={() => deleteInvoice(project.id, inv.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTES & SPECS */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Project Notes & Client Feedback</h3>
                <p className="text-xs text-gray-500">Keep meeting minutes, technical specifications, and client requirements safe.</p>
              </div>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white transition-colors ${theme.bg} ${theme.bgHover}`}
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>

            <textarea
              rows={12}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Type client meeting notes, design feedback, or system specs here..."
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
            />
          </div>
        </div>
      )}

      {/* REPORT BUG MODAL */}
      <Modal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        title="Report New Bug / Issue"
        maxWidth="md"
      >
        <form onSubmit={handleAddBugSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Bug Title *</label>
            <input
              type="text"
              required
              value={newBugTitle}
              onChange={(e) => setNewBugTitle(e.target.value)}
              placeholder="e.g. Payment Gateway timeout on checkout"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Severity Level</label>
            <select
              value={newBugSeverity}
              onChange={(e) => setNewBugSeverity(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
              <option value="critical">Critical (Blocking)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsBugModalOpen(false)} className="btn-secondary px-4 py-2 rounded-xl text-xs">
              Cancel
            </button>
            <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${theme.bg} ${theme.bgHover}`}>
              Submit Bug
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE INVOICE MODAL */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Invoice Milestone"
        maxWidth="md"
      >
        <form onSubmit={handleAddInvoiceSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Invoice # *</label>
            <input
              type="text"
              required
              value={newInvoiceNumber}
              onChange={(e) => setNewInvoiceNumber(e.target.value)}
              placeholder="INV-2026-001"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount ($) *</label>
            <input
              type="number"
              required
              value={newInvoiceAmount}
              onChange={(e) => setNewInvoiceAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="1200"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Due Date</label>
            <input
              type="date"
              value={newInvoiceDueDate}
              onChange={(e) => setNewInvoiceDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="btn-secondary px-4 py-2 rounded-xl text-xs">
              Cancel
            </button>
            <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${theme.bg} ${theme.bgHover}`}>
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deletingConfirm}
        onClose={() => setDeletingConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Client Workspace?"
        message={`Are you sure you want to delete "${project.name}"? All associated features, bugs, notes, and invoices will be permanently deleted.`}
      />
    </div>
  );
}
