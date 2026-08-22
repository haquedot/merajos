'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Code2,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  Flame,
  Building,
  DollarSign,
  MapPin,
  Sparkles,
  Download,
  Copy,
  FolderPlus,
  Trash2,
  Minus,
  Edit2,
  X,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useCareerStore, CareerTab } from '../../store/useCareerStore';
import { useTaskStore } from '../../store/useTaskStore';
import { JobApplication, JobStatus, DSATopic, InterviewTopic } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { Button } from '../../components/ui/button';
import { GridCardsSkeleton } from '../../components/ui/Skeleton';
import { SubjectPlanCard } from '../../components/career/SubjectPlanCard';
import { AddSubjectModal } from '../../components/career/AddSubjectModal';
import { AddTopicModal } from '../../components/career/AddTopicModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { PRESET_SUBJECT_PLANS } from '../../lib/careerPresets';

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<CareerTab>('roadmaps');

  // Modal Open States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDSAModalOpen, setIsDSAModalOpen] = useState(false);
  const [editingDSA, setEditingDSA] = useState<DSATopic | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewTopic | null>(null);
  const [activeSubjectIdForTopic, setActiveSubjectIdForTopic] = useState<string | null>(null);
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirm Delete Modal States
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'dsa' | 'interview' | 'job' | 'interviewChecklist';
    id: string;
    secondaryId?: string;
    title: string;
  } | null>(null);

  // New inline item state for interview checklist
  const [newInterviewItemText, setNewInterviewItemText] = useState<{ [topicId: string]: string }>({});

  // DSA form states
  const [dsaName, setDsaName] = useState('');
  const [dsaCategory, setDsaCategory] = useState('Striver SDE / NeetCode 150');
  const [dsaEasy, setDsaEasy] = useState(15);
  const [dsaMed, setDsaMed] = useState(25);
  const [dsaHard, setDsaHard] = useState(10);
  const [dsaNotes, setDsaNotes] = useState('');

  // Interview Category form state
  const [interviewCategory, setInterviewCategory] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const {
    jobs,
    interviewTopics,
    dsaTopics,
    subjectPlans,
    isLoadingTab,
    jobStatusFilter,
    dsaSearchQuery,
    loadTabData,
    addJob,
    updateJob,
    deleteJob,
    setJobStatusFilter,
    toggleInterviewChecklist,
    addInterviewChecklistItem,
    deleteInterviewChecklistItem,
    addInterviewTopic,
    updateInterviewTopic,
    deleteInterviewTopic,
    adjustDSACount,
    addDSATopic,
    updateDSATopic,
    deleteDSATopic,
    setDSASearchQuery,
    importPresetRoadmap,
    seedSoftwareEngineerData,
  } = useCareerStore();

  const { addTask } = useTaskStore();

  // Load data on demand whenever activeTab changes
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // Form states for job app
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const filteredJobs = jobs.filter((j) => jobStatusFilter === 'all' || j.status === jobStatusFilter);

  const filteredDSA = dsaTopics.filter(
    (d) =>
      d.name.toLowerCase().includes(dsaSearchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(dsaSearchQuery.toLowerCase())
  );

  const filteredSubjectPlans = subjectPlans.filter(
    (sp) => subjectCategoryFilter === 'all' || sp.category === subjectCategoryFilter
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Job CRUD
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setCompany('');
    setRole('');
    setStatus('Applied');
    setSalary('');
    setLocation('');
    setNotes('');
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (j: JobApplication) => {
    setEditingJob(j);
    setCompany(j.company);
    setRole(j.role);
    setStatus(j.status);
    setSalary(j.salary || '');
    setLocation(j.location || '');
    setNotes(j.notes || '');
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    if (editingJob) {
      updateJob(editingJob.id, {
        company: company.trim(),
        role: role.trim(),
        status,
        salary: salary.trim(),
        location: location.trim(),
        notes: notes.trim(),
      });
      showToast('Updated job application!');
    } else {
      addJob({
        company: company.trim(),
        role: role.trim(),
        appliedDate: new Date().toISOString().split('T')[0],
        status,
        salary: salary.trim(),
        location: location.trim(),
        notes: notes.trim(),
      });
      showToast('Added job application to pipeline!');
    }

    setIsJobModalOpen(false);
  };

  // DSA CRUD
  const handleOpenAddDSA = () => {
    setEditingDSA(null);
    setDsaName('');
    setDsaCategory('Striver SDE / NeetCode 150');
    setDsaEasy(15);
    setDsaMed(25);
    setDsaHard(10);
    setDsaNotes('');
    setIsDSAModalOpen(true);
  };

  const handleOpenEditDSA = (dsa: DSATopic) => {
    setEditingDSA(dsa);
    setDsaName(dsa.name);
    setDsaCategory(dsa.category);
    setDsaEasy(dsa.easyTotal);
    setDsaMed(dsa.mediumTotal);
    setDsaHard(dsa.hardTotal);
    setDsaNotes(dsa.notes || '');
    setIsDSAModalOpen(true);
  };

  const handleSaveDSA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsaName.trim()) return;

    if (editingDSA) {
      updateDSATopic(editingDSA.id, {
        name: dsaName.trim(),
        category: dsaCategory.trim(),
        easyTotal: dsaEasy,
        mediumTotal: dsaMed,
        hardTotal: dsaHard,
        notes: dsaNotes.trim(),
      });
      showToast(`Updated DSA Topic "${dsaName}"`);
    } else {
      addDSATopic(dsaName.trim(), dsaCategory.trim(), dsaEasy, dsaMed, dsaHard);
      showToast(`Added DSA Topic "${dsaName}"`);
    }

    setIsDSAModalOpen(false);
  };

  // Interview CRUD
  const handleOpenAddInterview = () => {
    setEditingInterview(null);
    setInterviewCategory('');
    setInterviewNotes('');
    setIsInterviewModalOpen(true);
  };

  const handleOpenEditInterview = (topic: InterviewTopic) => {
    setEditingInterview(topic);
    setInterviewCategory(topic.category);
    setInterviewNotes(topic.notes || '');
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewCategory.trim()) return;

    if (editingInterview) {
      updateInterviewTopic(editingInterview.id, {
        category: interviewCategory.trim() as any,
        notes: interviewNotes.trim(),
      });
      showToast(`Updated Category "${interviewCategory}"`);
    } else {
      addInterviewTopic(interviewCategory.trim(), interviewNotes.trim());
      showToast(`Added Interview Category "${interviewCategory}"`);
    }

    setIsInterviewModalOpen(false);
  };

  const handleAddInterviewChecklistItem = (topicId: string) => {
    const text = newInterviewItemText[topicId]?.trim();
    if (!text) return;

    addInterviewChecklistItem(topicId, text);
    setNewInterviewItemText((prev) => ({ ...prev, [topicId]: '' }));
    showToast('Checklist item added!');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { type, id, secondaryId } = deleteConfirmTarget;

    if (type === 'dsa') {
      deleteDSATopic(id);
      showToast('Deleted DSA topic!');
    } else if (type === 'interview') {
      deleteInterviewTopic(id);
      showToast('Deleted Interview category!');
    } else if (type === 'interviewChecklist' && secondaryId) {
      deleteInterviewChecklistItem(secondaryId, id);
      showToast('Deleted question item!');
    } else if (type === 'job') {
      deleteJob(id);
      showToast('Deleted job application!');
    }

    setDeleteConfirmTarget(null);
  };

  const handleCopyDSAToTask = async (dsaName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    await addTask({
      title: `Practice DSA: ${dsaName}`,
      description: `Solve problems for ${dsaName} from Career Prep module.`,
      status: 'todo',
      priority: 'high',
      category: 'Career',
      dueDate: todayStr,
      time: '09:00 AM',
      timeSlot: 'morning',
      recurring: 'none',
      mit: true,
      estimatedHours: 1.5,
      actualHours: 0,
      tags: ['dsa', 'leetcode', 'career'],
    });

    showToast(`Copied "${dsaName}" to Today Task Module!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-xl border border-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <PageHeader
        icon={GraduationCap}
        iconBgColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        title="Career Prep & Study Tracker"
        subtitle="Subject-wise roadmaps, modular topic checklists, DSA sheets, and job application pipeline"
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold w-full sm:w-auto justify-between shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('roadmaps')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${
                activeTab === 'roadmaps'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Study Plans ({subjectPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('dsa')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${
                activeTab === 'dsa'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              DSA Tracker ({dsaTopics.length})
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${
                activeTab === 'interview'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Interview Q&A ({interviewTopics.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Job Pipeline ({jobs.length})
            </button>
          </div>
        }
      />

      {/* Loading Skeleton during tab fetch */}
      {isLoadingTab ? (
        <GridCardsSkeleton count={4} />
      ) : (
        <>
          {/* Tab 1: Subject-Wise Study Plans */}
          {activeTab === 'roadmaps' && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                      <span>Subject-Wise Study Plans & Checklists</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Organize learning by core technical subjects, set modular topic checklists, and track mastery.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="w-40">
                      <Select
                        value={subjectCategoryFilter}
                        onValueChange={(val) => setSubjectCategoryFilter(val)}
                        options={[
                          { value: 'all', label: 'All Categories' },
                          { value: 'Web Development', label: 'Web Development' },
                          { value: 'System Architecture', label: 'System Architecture' },
                          { value: 'CS Core', label: 'CS Fundamentals' },
                        ]}
                      />
                    </div>

                    <button
                      onClick={() => setIsSubjectModalOpen(true)}
                      className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>New Subject Plan</span>
                    </button>
                  </div>
                </div>

                {/* Optional Starter Kit Button (Only visible if no subject plans exist) */}
                {subjectPlans.length === 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Need a quick start?</span>
                    </span>

                    <button
                      onClick={() => {
                        seedSoftwareEngineerData();
                        showToast('Loaded Software Engineer Starter Kit!');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-orbit-blue text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Load Software Engineer Starter Kit</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Subject Plans Grid or Empty State */}
              {filteredSubjectPlans.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 max-w-lg mx-auto shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      No Subject Plans Created Yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Create your own custom subject plan from scratch, or load a pre-built Software Engineer curriculum.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                    <button
                      onClick={() => setIsSubjectModalOpen(true)}
                      className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create First Subject Plan</span>
                    </button>

                    <button
                      onClick={() => {
                        seedSoftwareEngineerData();
                        showToast('Loaded Software Engineer Starter Kit!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-orbit-blue text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Load Software Engineer Starter Kit</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSubjectPlans.map((plan) => (
                    <SubjectPlanCard
                      key={plan.id}
                      plan={plan}
                      onAddTopic={(subjectId) => setActiveSubjectIdForTopic(subjectId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: DSA Tracker */}
          {activeTab === 'dsa' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-500" />
                    <span>Data Structures & Algorithms (DSA) Sheet</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Track topic-wise solved problems with interactive counters and copy study goals into Today tasks.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={dsaSearchQuery}
                      onChange={(e) => setDSASearchQuery(e.target.value)}
                      placeholder="Search DSA topics..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddDSA}
                    className="btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add DSA Topic</span>
                  </button>
                </div>
              </div>

              {filteredDSA.length === 0 ? (
                <div className="p-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Your DSA Sheet is Empty
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add custom problem categories (e.g. Dynamic Programming, Binary Search, Graph Algorithms) to log solved problem counts.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddDSA}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First DSA Topic</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {filteredDSA.map((dsa) => {
                    const totalSolved = dsa.easySolved + dsa.mediumSolved + dsa.hardSolved;
                    const totalTarget = dsa.easyTotal + dsa.mediumTotal + dsa.hardTotal;
                    const perc = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

                    return (
                      <div
                        key={dsa.id}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-[200px] flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                              {dsa.name}
                            </h3>
                            <Badge variant="info" size="sm">
                              {dsa.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400 block">{dsa.notes}</span>
                        </div>

                        {/* Interactive Solved Counters */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Easy counter */}
                          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span>Easy: {dsa.easySolved}/{dsa.easyTotal}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'easy', -1)}
                                className="w-4 h-4 rounded-md bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center hover:opacity-80"
                              >
                                <Minus className="w-3 h-3 text-emerald-900 dark:text-white" />
                              </button>
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'easy', 1)}
                                className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:opacity-80"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Medium counter */}
                          <div className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <span>Med: {dsa.mediumSolved}/{dsa.mediumTotal}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'medium', -1)}
                                className="w-4 h-4 rounded-md bg-amber-200 dark:bg-amber-800 flex items-center justify-center hover:opacity-80"
                              >
                                <Minus className="w-3 h-3 text-amber-900 dark:text-white" />
                              </button>
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'medium', 1)}
                                className="w-4 h-4 rounded-md bg-amber-600 text-white flex items-center justify-center hover:opacity-80"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Hard counter */}
                          <div className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                            <span>Hard: {dsa.hardSolved}/{dsa.hardTotal}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'hard', -1)}
                                className="w-4 h-4 rounded-md bg-rose-200 dark:bg-rose-800 flex items-center justify-center hover:opacity-80"
                              >
                                <Minus className="w-3 h-3 text-rose-900 dark:text-white" />
                              </button>
                              <button
                                onClick={() => adjustDSACount(dsa.id, 'hard', 1)}
                                className="w-4 h-4 rounded-md bg-rose-600 text-white flex items-center justify-center hover:opacity-80"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${perc}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">
                              {perc}%
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyDSAToTask(dsa.name)}
                            className="px-2 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-orbit-blue hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Copy to Today Module as Task"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditDSA(dsa)}
                            className="p-1 text-gray-400 hover:text-orbit-blue transition-colors"
                            title="Edit DSA Topic"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'dsa',
                                id: dsa.id,
                                title: dsa.name,
                              })
                            }
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Delete DSA Topic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Interview Q&A Checklists */}
          {activeTab === 'interview' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Core Technical Interview Curriculum
                  </h2>
                  <p className="text-xs text-gray-500">
                    Key interview questions and mastery gates. Add custom items to any category!
                  </p>
                </div>

                <button
                  onClick={handleOpenAddInterview}
                  className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {interviewTopics.length === 0 ? (
                <div className="p-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      No Interview Categories Created
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Create custom categories (e.g., System Architecture, Web Performance, Database Indexing) to track technical Q&As.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddInterview}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Interview Category</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviewTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-emerald-500" />
                          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                            {topic.category}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-500">
                            {topic.progress}% Mastered
                          </span>
                          <button
                            onClick={() => handleOpenEditInterview(topic)}
                            className="p-1 text-gray-400 hover:text-[#1F3B99] dark:hover:text-[#6D5BFF] transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'interview',
                                id: topic.id,
                                title: topic.category,
                              })
                            }
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>

                      {topic.notes && <p className="text-xs text-gray-500 leading-relaxed">{topic.notes}</p>}

                      {/* Checklist Items */}
                      <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          Key Mastery Checklist
                        </span>
                        {topic.checklist.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2.5 text-xs text-gray-700 dark:text-gray-300 group"
                          >
                            <div
                              onClick={() => toggleInterviewChecklist(topic.id, item.id)}
                              className="flex items-center gap-2.5 cursor-pointer hover:text-emerald-500 flex-1"
                            >
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                                  item.completed
                                    ? 'bg-emerald-500 text-white'
                                    : 'border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {item.completed && '✓'}
                              </div>
                              <span className={item.completed ? 'line-through text-gray-400' : ''}>
                                {item.task}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'interviewChecklist',
                                  id: item.id,
                                  secondaryId: topic.id,
                                  title: item.task,
                                })
                              }
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-rose-600 transition-opacity"
                              title="Delete item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Inline Add Checklist Item Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newInterviewItemText[topic.id] || ''}
                            onChange={(e) =>
                              setNewInterviewItemText((prev) => ({ ...prev, [topic.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddInterviewChecklistItem(topic.id);
                            }}
                            placeholder="Add question / checklist item..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleAddInterviewChecklistItem(topic.id)}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-bold shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Job Applications Pipeline */}
          {activeTab === 'jobs' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Job Applications Database
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-44">
                    <Select
                      value={jobStatusFilter}
                      onValueChange={(val) => setJobStatusFilter(val)}
                      options={[
                        { value: 'all', label: 'All Pipeline Stages' },
                        { value: 'Applied', label: 'Applied' },
                        { value: 'OA', label: 'Online Assessment (OA)' },
                        { value: 'Interview', label: 'Interview' },
                        { value: 'Offer', label: 'Offer' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]}
                    />
                  </div>

                  <button
                    onClick={handleOpenAddJob}
                    className="btn-primary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Application</span>
                  </button>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="p-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      No Job Applications Tracked
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Track job listings, interview rounds, salary ranges, and recruiter contacts.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddJob}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Application</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                            {job.company}
                          </h3>
                          <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                            {job.role}
                          </span>
                        </div>

                        <div className="w-28">
                          <Select
                            value={job.status}
                            onValueChange={(val) => updateJob(job.id, { status: val as JobStatus })}
                            options={[
                              { value: 'Applied', label: 'Applied' },
                              { value: 'OA', label: 'OA' },
                              { value: 'Interview', label: 'Interview' },
                              { value: 'Offer', label: 'Offer' },
                              { value: 'Rejected', label: 'Rejected' },
                            ]}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{job.salary || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                      </div>

                      {job.notes && (
                        <p className="text-[11px] text-gray-400 italic bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800 leading-relaxed">
                          "{job.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                        <span>Applied: {job.appliedDate}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditJob(job)}
                            className="text-[#1F3B99] dark:text-[#6D5BFF] font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'job',
                                id: job.id,
                                title: `${job.company} - ${job.role}`,
                              })
                            }
                            className="text-rose-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Job Modal */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editingJob ? 'Edit Job Application' : 'Add Job Application'}
      >
        <form onSubmit={handleSaveJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <Input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google / Stripe / Linear"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Role *
              </label>
              <Input
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pipeline Status
              </label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as JobStatus)}
                options={[
                  { value: 'Applied', label: 'Applied' },
                  { value: 'OA', label: 'OA' },
                  { value: 'Interview', label: 'Interview' },
                  { value: 'Offer', label: 'Offer' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Salary Estimate
              </label>
              <Input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$160,000 - $200,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral contact, recruiter name, interview notes..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsJobModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingJob ? 'Update Application' : 'Save Application'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={activeSubjectIdForTopic !== null}
        subjectId={activeSubjectIdForTopic}
        onClose={() => setActiveSubjectIdForTopic(null)}
      />

      {/* Add / Edit DSA Category Modal */}
      <Modal
        isOpen={isDSAModalOpen}
        onClose={() => setIsDSAModalOpen(false)}
        title={editingDSA ? 'Edit DSA Category / Topic' : 'Add DSA Category / Sheet Topic'}
      >
        <form onSubmit={handleSaveDSA} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Topic Name *
            </label>
            <Input
              required
              value={dsaName}
              onChange={(e) => setDsaName(e.target.value)}
              placeholder="e.g. Dynamic Programming (2D), Heap & Priority Queue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Sheet
            </label>
            <Input
              value={dsaCategory}
              onChange={(e) => setDsaCategory(e.target.value)}
              placeholder="Striver SDE / NeetCode 150 / LeetCode 75"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Easy Target
              </label>
              <Input
                type="number"
                min="0"
                value={dsaEasy}
                onChange={(e) => setDsaEasy(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Medium Target
              </label>
              <Input
                type="number"
                min="0"
                value={dsaMed}
                onChange={(e) => setDsaMed(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Hard Target
              </label>
              <Input
                type="number"
                min="0"
                value={dsaHard}
                onChange={(e) => setDsaHard(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <Input
              value={dsaNotes}
              onChange={(e) => setDsaNotes(e.target.value)}
              placeholder="Focus area, key algorithms..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDSAModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingDSA ? 'Update Topic' : 'Add DSA Topic'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Interview Category Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={editingInterview ? 'Edit Interview Category' : 'Add Interview Category'}
      >
        <form onSubmit={handleSaveInterview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Title *
            </label>
            <Input
              required
              value={interviewCategory}
              onChange={(e) => setInterviewCategory(e.target.value)}
              placeholder="e.g. MongoDB & Indexing / Web Security / System Design"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Notes / Focus Area
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Key concepts to review..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsInterviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingInterview ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reusable Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmTarget !== null}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        itemName={deleteConfirmTarget?.title}
        message="Are you sure you want to delete this item? This action will remove it permanently."
      />
    </div>
  );
}
