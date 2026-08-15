'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  FileText,
  Trash2,
  Edit2,
  Award,
  List,
} from 'lucide-react';
import { useCareerStore } from '../../../store/useCareerStore';
import { useTaskStore } from '../../../store/useTaskStore';
import { SubjectTopic } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { AddTopicModal } from '../../../components/career/AddTopicModal';
import { ConfirmDeleteModal } from '../../../components/modals/ConfirmDeleteModal';
import { PRESET_SUBJECT_PLANS } from '../../../lib/careerPresets';

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default function SubjectReaderPage({ params }: PageProps) {
  const { subjectId } = use(params);

  const {
    subjectPlans,
    isLoadingTab,
    loadSubjectPlanById,
    toggleTopicChecklist,
    updateSubjectTopic,
    deleteSubjectTopic,
  } = useCareerStore();

  React.useEffect(() => {
    loadSubjectPlanById(subjectId);
  }, [subjectId, loadSubjectPlanById]);

  const { addTask } = useTaskStore();

  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<SubjectTopic | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Find target subject plan
  const plan = subjectPlans.find((sp) => sp.id === subjectId) || PRESET_SUBJECT_PLANS.find((sp) => sp.id === subjectId);

  // Active topic index state
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);

  // Edit topic form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [editNotes, setEditNotes] = useState('');

  if (isLoadingTab || !plan) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1F3B99] dark:border-[#6D5BFF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">Loading Study Reader...</p>
      </div>
    );
  }

  const currentTopic = plan.topics[activeTopicIndex] || plan.topics[0];

  // Calculate overall subject progress
  let totalItems = 0;
  let completedItems = 0;
  plan.topics.forEach((t) => {
    t.checklist.forEach((c) => {
      totalItems++;
      if (c.completed) completedItems++;
    });
  });
  const overallPerc = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEditTopic = (topic: SubjectTopic) => {
    setEditTitle(topic.title);
    setEditDescription(topic.description || '');
    setEditDifficulty(topic.difficulty || 'Intermediate');
    setEditNotes(topic.notes || '');
    setIsEditTopicModalOpen(true);
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTopic || !editTitle.trim()) return;

    updateSubjectTopic(plan.id, currentTopic.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      difficulty: editDifficulty,
      notes: editNotes.trim(),
    });

    setIsEditTopicModalOpen(false);
    showToast(`Updated topic "${editTitle}"`);
  };

  const handleConfirmDeleteTopic = () => {
    if (!deleteTopicTarget) return;
    deleteSubjectTopic(plan.id, deleteTopicTarget.id);
    setDeleteTopicTarget(null);
    setActiveTopicIndex((prev) => Math.max(0, prev - 1));
    showToast('Topic deleted permanently!');
  };

  const handleCopyTopicToTask = async () => {
    if (!currentTopic) return;
    const todayStr = new Date().toISOString().split('T')[0];
    await addTask({
      title: `Study Topic: ${currentTopic.title}`,
      description: `${currentTopic.description || ''}\nSubject: ${plan.title}`,
      status: 'todo',
      priority: 'high',
      category: 'Career',
      dueDate: todayStr,
      time: '10:00 AM',
      timeSlot: 'morning',
      recurring: 'none',
      mit: true,
      estimatedHours: 1.5,
      actualHours: 0,
      tags: ['study', plan.category.toLowerCase().replace(/\s+/g, '-'), 'orbit-career'],
    });

    showToast(`Copied "${currentTopic.title}" to Today Task Module!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-xl border border-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standardized PageHeader Component */}
      <PageHeader
        icon={BookOpen}
        iconBgColor="bg-[#1F3B99]/10 text-[#1F3B99] dark:bg-[#6D5BFF]/20 dark:text-[#6D5BFF]"
        title={plan.title}
        subtitle="Interactive Study Reader & Topic Mastery Environment"
        badgeText={plan.category}
        badgeVariant="emerald"
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Link
              href="/career"
              className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Plans</span>
            </Link>

            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Topic</span>
            </button>
          </div>
        }
      />

      {/* Mobile Topic Accordion Selector (Visible on Mobile Screens) */}
      <div className="lg:hidden p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="w-full flex items-center justify-between gap-2 text-xs font-extrabold text-gray-900 dark:text-white"
        >
          <div className="flex items-center gap-2 min-w-0">
            <List className="w-4 h-4 text-[#1F3B99] dark:text-[#6D5BFF]" />
            <span className="truncate">
              Topic {activeTopicIndex + 1}/{plan.topics.length}: {currentTopic?.title}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isMobileDrawerOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMobileDrawerOpen && (
          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 max-h-60 overflow-y-auto no-scrollbar">
            {plan.topics.map((topic, index) => {
              const isActive = index === activeTopicIndex;
              const topicCompleted = topic.checklist.filter((c) => c.completed).length;
              const topicTotal = topic.checklist.length;

              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setActiveTopicIndex(index);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span className="truncate">{index + 1}. {topic.title}</span>
                  <span className="text-[10px] shrink-0 opacity-80">{topicCompleted}/{topicTotal}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reader Grid: Sidebar & Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Sidebar (Desktop View) */}
        <div className="hidden lg:block lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5 lg:sticky lg:top-6">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Overall Mastery</span>
              </span>
              <span className="font-black text-[#1F3B99] dark:text-[#6D5BFF]">
                {overallPerc}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallPerc}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 block text-right">
              {completedItems} of {totalItems} items completed
            </span>
          </div>

          {/* Topics List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                Curriculum Topics ({plan.topics.length})
              </span>
            </div>

            {plan.topics.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No topics in this subject yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar">
                {plan.topics.map((topic, index) => {
                  const isActive = index === activeTopicIndex;
                  const topicCompleted = topic.checklist.filter((c) => c.completed).length;
                  const topicTotal = topic.checklist.length;
                  const topicPerc =
                    topicTotal > 0 ? Math.round((topicCompleted / topicTotal) * 100) : 0;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => setActiveTopicIndex(index)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 border ${
                        isActive
                          ? 'bg-[#1F3B99]/5 dark:bg-[#6D5BFF]/10 border-[#1F3B99] dark:border-[#6D5BFF] shadow-2xs'
                          : 'bg-gray-50/70 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            topicPerc === 100
                              ? 'bg-emerald-500 text-white'
                              : isActive
                              ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {topicPerc === 100 ? '✓' : index + 1}
                        </div>

                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-extrabold truncate ${
                              isActive
                                ? 'text-[#1F3B99] dark:text-[#6D5BFF]'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {topic.title}
                          </h4>
                          {topic.difficulty && (
                            <span className="text-[10px] text-gray-400 block">
                              {topic.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {topicCompleted}/{topicTotal}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Content Reader */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {!currentTopic ? (
            <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                No topic selected.
              </p>
            </div>
          ) : (
            <motion.div
              key={currentTopic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5"
            >
              {/* Topic Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white break-words">
                      {currentTopic.title}
                    </h2>
                    {currentTopic.difficulty && (
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                          currentTopic.difficulty === 'Advanced'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : currentTopic.difficulty === 'Intermediate'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {currentTopic.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status Selector */}
                  <div className="w-32">
                    <Select
                      value={currentTopic.status}
                      onValueChange={(val) =>
                        updateSubjectTopic(plan.id, currentTopic.id, {
                          status: val as any,
                        })
                      }
                      options={[
                        { value: 'todo', label: 'Todo' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'mastered', label: 'Mastered' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditTopic(currentTopic)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 transition-colors"
                      title="Edit Topic Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTopicTarget(currentTopic)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleCopyTopicToTask}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#1F3B99] dark:text-[#6D5BFF] hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy to Task</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Topic Description */}
              {currentTopic.description && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Topic Overview & Learning Objectives
                  </span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {currentTopic.description}
                  </p>
                </div>
              )}

              {/* Resource Links */}
              {currentTopic.resources && currentTopic.resources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Curated External Resources
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentTopic.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-[#1F3B99] dark:hover:text-[#6D5BFF] flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span>{res.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Key Mastery Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Key Mastery Checklist</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {currentTopic.checklist.filter((c) => c.completed).length} /{' '}
                    {currentTopic.checklist.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {currentTopic.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTopicChecklist(plan.id, currentTopic.id, item.id)}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-3 cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                          item.completed
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'border-2 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.completed && '✓'}
                      </div>
                      <span
                        className={`text-xs font-semibold leading-snug break-words flex-1 ${
                          item.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Code Snippets Box */}
              {currentTopic.notes && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5 text-xs text-amber-900 dark:text-amber-300">
                  <div className="flex items-center gap-2 font-bold">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Topic Key Takeaways & Formula Notes</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{currentTopic.notes}</p>
                </div>
              )}

              {/* Reader Sequential Navigation Footer */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  disabled={activeTopicIndex === 0}
                  onClick={() => setActiveTopicIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous Topic</span>
                </button>

                <span className="text-[11px] sm:text-xs font-bold text-gray-400 text-center">
                  Topic {activeTopicIndex + 1} of {plan.topics.length}
                </span>

                <button
                  disabled={activeTopicIndex >= plan.topics.length - 1}
                  onClick={() =>
                    setActiveTopicIndex((prev) => Math.min(plan.topics.length - 1, prev + 1))
                  }
                  className="px-3 sm:px-4 py-2 rounded-xl bg-[#1F3B99] dark:bg-[#6D5BFF] hover:opacity-90 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  <span className="hidden sm:inline">Next Topic</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Topic Modal */}
      <Modal
        isOpen={isEditTopicModalOpen}
        onClose={() => setIsEditTopicModalOpen(false)}
        title="Edit Topic Details"
      >
        <form onSubmit={handleSaveEditTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Topic Title *
            </label>
            <Input
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <Select
              value={editDifficulty}
              onValueChange={(val) => setEditDifficulty(val as any)}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Overview & Learning Objectives
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Topic Takeaways & Formula Notes
            </label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditTopicModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        subjectId={plan.id}
        onClose={() => setIsAddTopicModalOpen(false)}
      />

      {/* Confirm Delete Topic Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTopicTarget !== null}
        onClose={() => setDeleteTopicTarget(null)}
        onConfirm={handleConfirmDeleteTopic}
        title="Delete Topic"
        itemName={deleteTopicTarget?.title}
        message="Are you sure you want to delete this curriculum topic? All its checklist progress and notes will be permanently removed."
      />
    </div>
  );
}
