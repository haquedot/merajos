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
import { ProjectFeature, ProjectBug, ProjectInvoice, Project, Category } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { CircularProgress } from '../../../components/ui/CircularProgress';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../../components/modals/ConfirmDeleteModal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { DatePicker } from '../../../components/ui/date-picker';
import { Button } from '../../../components/ui/button';
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

  // Copy Task Deadline Modal States
  const [isCopyTaskModalOpen, setIsCopyTaskModalOpen] = useState(false);
  const [copyTaskTitle, setCopyTaskTitle] = useState('');
  const [copyTaskCategory, setCopyTaskCategory] = useState<Category>('Client');
  const [copyTaskPriority, setCopyTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [copyTaskDueDate, setCopyTaskDueDate] = useState('');
  const [copyTaskTags, setCopyTaskTags] = useState<string[]>([]);
  const [copyTaskEstHours, setCopyTaskEstHours] = useState<number>(1);

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

  // Prompt Deadline before Copying Feature to Task
  const handleCopyFeatureToTask = (feature: ProjectFeature) => {
    setCopyTaskTitle(`Feature: ${feature.title} (${project.name})`);
    setCopyTaskCategory('Client');
    setCopyTaskPriority(feature.priority === 'high' ? 'high' : 'medium');
    setCopyTaskTags(['client', 'feature', project.clientName || 'work']);
    setCopyTaskDueDate(project.deadline || new Date().toISOString().split('T')[0]);
    setCopyTaskEstHours(1);
    setIsCopyTaskModalOpen(true);
  };

  // Prompt Deadline before Copying Bug to Task
  const handleCopyBugToTask = (bug: ProjectBug) => {
    setCopyTaskTitle(`Fix Bug: ${bug.title} (${project.name})`);
    setCopyTaskCategory('Client');
    setCopyTaskPriority(bug.severity === 'critical' || bug.severity === 'high' ? 'urgent' : 'high');
    setCopyTaskTags(['client', 'bug', 'urgent']);
    setCopyTaskDueDate(project.deadline || new Date().toISOString().split('T')[0]);
    setCopyTaskEstHours(1);
    setIsCopyTaskModalOpen(true);
  };

  // Confirm Task Creation with Chosen Deadline
  const handleConfirmCopyTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDueDate = copyTaskDueDate || new Date().toISOString().split('T')[0];
    addTask({
      title: copyTaskTitle,
      category: copyTaskCategory,
      priority: copyTaskPriority,
      status: 'todo',
      tags: copyTaskTags,
      dueDate: selectedDueDate,
      estimatedHours: copyTaskEstHours,
      actualHours: 0,
      recurring: 'none',
      mit: false,
    });
    setIsCopyTaskModalOpen(false);
    showToast(`Task created with deadline: ${selectedDueDate}`);
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
                className="bg-rose-500/10 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-500/20 dark:hover:bg-rose-500/50 flex items-center gap-1.5 cursor-pointer"
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
              <div className="flex-1">
                <Input
                  value={newFeatureTitle}
                  onChange={(e) => setNewFeatureTitle(e.target.value)}
                  placeholder="Enter new feature requirement..."
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  value={newFeaturePriority}
                  onValueChange={(val) => setNewFeaturePriority(val as any)}
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'medium', label: 'Medium Priority' },
                    { value: 'high', label: 'High Priority' },
                  ]}
                />
              </div>
              <Button type="submit" className="shrink-0 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </Button>
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
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-200 dark:hover:border-purple-900 transition-colors"
                  >
                    <div className="flex items-start tems-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                      <button
                        onClick={() => toggleFeature(project.id, feature.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                          feature.completed
                            ? `${theme.bg} text-white`
                            : 'border border-gray-300 dark:border-gray-600 hover:border-purple-500'
                        }`}
                      >
                        {feature.completed && '✓'}
                      </button>
                      <div className="min-w-0 flex-1 mt-1">
                        <span
                          className={`text-xs font-bold block leading-snug break-words ${
                            feature.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {feature.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-start sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <Badge variant={feature.priority === 'high' ? 'danger' : theme.badgeVariant} size="sm">
                        {feature.priority || 'medium'}
                      </Badge>

                      <button
                        onClick={() => handleCopyFeatureToTask(feature)}
                        className={`cursor-pointer px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${theme.bgLight} ${theme.text}`}
                        title="Copy feature to Task module with deadline"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy to Task</span>
                      </button>

                      <button
                        onClick={() => deleteFeature(project.id, feature.id)}
                        className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
                    <div className="space-y-1 min-w-0 flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-900 dark:text-white leading-snug break-words">{bug.title}</span>
                        <Badge variant={bug.severity === 'critical' || bug.severity === 'high' ? 'danger' : 'warning'} size="sm">
                          {bug.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <div className="w-28">
                        <Select
                          value={bug.status}
                          onValueChange={(val) => updateBugStatus(project.id, bug.id, val as any)}
                          options={[
                            { value: 'open', label: 'Open' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'resolved', label: 'Resolved' },
                          ]}
                        />
                      </div>

                      <button
                        onClick={() => handleCopyBugToTask(bug)}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Copy bug to Task module with deadline"
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
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {!project.invoices || project.invoices.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                  <Receipt className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No invoices issued yet.</p>
                  <p className="text-[11px] text-gray-400">Create an invoice milestone to track payments.</p>
                </div>
              ) : (
                project.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                        <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'} size="sm">
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Amount: <strong className="text-gray-800 dark:text-gray-200">{project.currency || '$'}{inv.amount.toLocaleString()}</strong> | Due: {inv.dueDate || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <div className="w-32">
                        <Select
                          value={inv.status}
                          onValueChange={(val) => updateInvoiceStatus(project.id, inv.id, val as any)}
                          options={[
                            { value: 'unpaid', label: 'Unpaid' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'overdue', label: 'Overdue' },
                          ]}
                        />
                      </div>

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
                <h3 className="text-base font-black text-gray-900 dark:text-white">Project Notes & Specifications</h3>
                <p className="text-xs text-gray-500">Save client meeting notes, scope documents, or access links.</p>
              </div>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white transition-colors cursor-pointer ${theme.bg} ${theme.bgHover}`}
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>

            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={12}
              placeholder="Type client project notes, requirements, links, or instructions..."
              className="w-full p-4 text-xs font-mono rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 leading-relaxed resize-y"
            />
          </div>
        </div>
      )}

      {/* COPY TASK DEADLINE MODAL */}
      <Modal
        isOpen={isCopyTaskModalOpen}
        onClose={() => setIsCopyTaskModalOpen(false)}
        title="Set Deadline for Copied Task"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCopyTaskSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Task Title *</label>
            <Input
              value={copyTaskTitle}
              onChange={(e) => setCopyTaskTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Target Deadline (Due Date) *</label>
            <DatePicker
              value={copyTaskDueDate}
              onChange={(val) => setCopyTaskDueDate(val)}
            />
            {/* Quick Deadline Presets */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => setCopyTaskDueDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-[11px] font-bold text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              >
                ⚡ Today
              </button>
              <button
                type="button"
                onClick={() => setCopyTaskDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-[11px] font-bold text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              >
                📅 Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setCopyTaskDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-[11px] font-bold text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              >
                🗓️ In 1 Week
              </button>
              {project.deadline && (
                <button
                  type="button"
                  onClick={() => setCopyTaskDueDate(project.deadline!)}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  🎯 Project Deadline ({project.deadline})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Priority</label>
              <Select
                value={copyTaskPriority}
                onValueChange={(val) => setCopyTaskPriority(val as any)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Estimated Hours</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={copyTaskEstHours}
                onChange={(e) => setCopyTaskEstHours(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsCopyTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className={`${theme.bg} text-white`}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Confirm & Add Task</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* REPORT BUG MODAL */}
      <Modal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        title="Report Software Bug"
        maxWidth="md"
      >
        <form onSubmit={handleAddBugSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Bug Title *</label>
            <Input
              required
              value={newBugTitle}
              onChange={(e) => setNewBugTitle(e.target.value)}
              placeholder="e.g. Payment Gateway timeout on checkout"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Severity Level</label>
            <Select
              value={newBugSeverity}
              onValueChange={(val) => setNewBugSeverity(val as any)}
              options={[
                { value: 'low', label: 'Low Severity' },
                { value: 'medium', label: 'Medium Severity' },
                { value: 'high', label: 'High Severity' },
                { value: 'critical', label: 'Critical (Blocking)' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsBugModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Bug
            </Button>
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
            <Input
              required
              value={newInvoiceNumber}
              onChange={(e) => setNewInvoiceNumber(e.target.value)}
              placeholder="INV-2026-001"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount ($) *</label>
            <Input
              type="number"
              required
              value={newInvoiceAmount}
              onChange={(e) => setNewInvoiceAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="1200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Due Date</label>
            <DatePicker
              value={newInvoiceDueDate}
              onChange={(val) => setNewInvoiceDueDate(val)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
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
