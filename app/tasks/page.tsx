'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Calendar,
  ArrowUpDown,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  GripVertical,
  MoveRight,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { Task, Priority, TaskStatus, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { Button } from '../../components/ui/button';
import { db } from '../../database/dexie';

import { TaskSkeleton } from '../../components/ui/Skeleton';

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [scheduledToast, setScheduledToast] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverCol, setDraggedOverCol] = useState<TaskStatus | null>(null);

  const {
    tasks,
    isLoading: isLoadingTasks,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    setSearchQuery,
    setFilterCategory,
    setFilterPriority,
    setFilterStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleMIT,
  } = useTaskStore();

  const { projects } = useProjectStore();
  const { events } = useCalendarStore();

  // Date filter state (default: 'all')
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'custom'>('today');
  const [customSelectedDate, setCustomSelectedDate] = useState<string>(todayStr);

  const activeDateStr = dateFilter === 'today' ? todayStr : dateFilter === 'custom' ? customSelectedDate : null;

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formCategory, setFormCategory] = useState<Category>('Personal');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formEventId, setFormEventId] = useState<string>('');
  const [formEstHours, setFormEstHours] = useState<number>(1);
  const [formDueDate, setFormDueDate] = useState(todayStr);

  // Filter tasks logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesDate = !activeDateStr || t.dueDate === activeDateStr;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDate;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormCategory('Personal');
    setFormProjectId('');
    setFormEventId('');
    setFormEstHours(1);
    setFormDueDate(activeDateStr || todayStr);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    setFormTitle(t.title);
    setFormDesc(t.description || '');
    setFormPriority(t.priority);
    setFormStatus(t.status);
    setFormCategory(t.category);
    setFormProjectId(t.projectId || '');
    setFormEventId(t.eventId || '');
    setFormEstHours(t.estimatedHours);
    setFormDueDate(t.dueDate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        projectId: formProjectId || undefined,
        eventId: formEventId || undefined,
        estimatedHours: Number(formEstHours) || 1,
        dueDate: formDueDate,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        projectId: formProjectId || undefined,
        eventId: formEventId || undefined,
        estimatedHours: Number(formEstHours) || 1,
        actualHours: 0,
        dueDate: formDueDate,
        recurring: 'none',
        tags: [formCategory],
        mit: false,
      });
    }

    setIsModalOpen(false);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverCol !== colKey) {
      setDraggedOverCol(colKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedOverCol(null);
    setDraggedTaskId(null);

    if (id) {
      const task = tasks.find((t) => t.id === id);
      if (task && task.status !== colKey) {
        updateTask(id, {
          status: colKey,
          actualHours: colKey === 'completed' ? task.estimatedHours : task.actualHours,
        });
      }
    }
  };

  const boardColumns: { key: TaskStatus; label: string; color: string; badgeBg: string }[] = [
    { key: 'todo', label: 'To Do', color: 'border-blue-500', badgeBg: 'bg-blue-500/10 text-blue-500' },
    { key: 'in_progress', label: 'In Progress', color: 'border-amber-500', badgeBg: 'bg-amber-500/10 text-amber-500' },
    { key: 'completed', label: 'Completed', color: 'border-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-500' },
  ];

  if (isLoadingTasks) {
    return <TaskSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <PageHeader
        icon={CheckSquare}
        iconBgColor="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        title="Task Management & Board"
        badgeText={`${filteredTasks.length} Tasks`}
        badgeVariant="blue"
        subtitle="Drag and drop cards across columns to update task progress dynamically"
        actions={
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold shrink-0">
              <button
                onClick={() => setViewMode('board')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-gray-900 text-orbit-blue shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-orbit-blue shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="inline">List</span>
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="btn-primary px-3 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </>
        }
      />

      {scheduledToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-between animate-fade-in">
          <span>{scheduledToast}</span>
          <button onClick={() => setScheduledToast(null)} className="text-emerald-500 hover:text-emerald-700">
            ✕
          </button>
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mr-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Selected Date:
              </span> */}

              {/* Prev Day Button */}
              <button
                type="button"
                onClick={() => {
                  const current = new Date(activeDateStr || todayStr);
                  current.setDate(current.getDate() - 1);
                  const prevStr = current.toISOString().split('T')[0];
                  setCustomSelectedDate(prevStr);
                  setDateFilter(prevStr === todayStr ? 'today' : 'custom');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title="Previous Day"
              >
                ← Prev
              </button>

              {/* <button
                type="button"
                onClick={() => {
                  setDateFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateFilter === 'all'
                    ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Tasks ({tasks.length})
              </button> */}

              <button
                type="button"
                onClick={() => {
                  setDateFilter('today');
                  setCustomSelectedDate(todayStr);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateFilter === 'today'
                    ? 'bg-orbit-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Today ({tasks.filter((t) => t.dueDate === todayStr).length})
              </button>

              {/* Next Day Button */}
              <button
                type="button"
                onClick={() => {
                  const current = new Date(activeDateStr || todayStr);
                  current.setDate(current.getDate() + 1);
                  const nextStr = current.toISOString().split('T')[0];
                  setCustomSelectedDate(nextStr);
                  setDateFilter(nextStr === todayStr ? 'today' : 'custom');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title="Next Day"
              >
                Next →
              </button>

              {/* Custom Date Picker */}
              <div className="flex items-center gap-1.5 ml-1">
                <DatePicker
                  value={activeDateStr || todayStr}
                  onChange={(selected) => {
                    setCustomSelectedDate(selected);
                    setDateFilter(selected === todayStr ? 'today' : 'custom');
                  }}
                />
              </div>
            </div>

            {/* Quick Status Count Summary */}
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                To Do: {filteredTasks.filter((t) => t.status === 'todo').length}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                In Progress: {filteredTasks.filter((t) => t.status === 'in_progress').length}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                Completed: {filteredTasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              value={selectedCategory}
              onValueChange={(val) => setFilterCategory(val)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Client Work', label: 'Client Work' },
                { value: 'Research', label: 'Research' },
                { value: 'Career', label: 'Career' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Habit', label: 'Habit' },
              ]}
            />

            <Select
              value={selectedPriority}
              onValueChange={(val) => setFilterPriority(val)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />

            <Select
              value={selectedStatus}
              onValueChange={(val) => setFilterStatus(val)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>

      {/* Kanban Board View with Drag & Drop */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boardColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            const isTarget = draggedOverCol === col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`p-4 rounded-3xl transition-all duration-200 min-h-[500px] flex flex-col ${
                  isTarget
                    ? 'bg-blue-500/5 dark:bg-blue-500/10 border-2 border-dashed border-blue-500/50 shadow-lg scale-[1.01]'
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs'
                }`}
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {col.label}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Drop Area */}
                <div className="flex-1 space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800/80 rounded-2xl text-gray-400 text-xs italic text-center p-4">
                      <span>Drag tasks here</span>
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const isBeingDragged = draggedTaskId === t.id;

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDraggedOverCol(null);
                          }}
                          className={`group p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800/80 space-y-3 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-2xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 ${
                            isBeingDragged ? 'opacity-40 scale-95 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                              <span className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                                {t.title}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleTaskStatus(t.id)}
                              className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${
                                t.status === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                              }`}
                            >
                              {t.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          </div>

                          {t.description && (
                            <p className="text-[11px] text-gray-400 line-clamp-2 pl-6">
                              {t.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[10px] text-gray-400 pl-6">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" size="sm">
                                {t.category}
                              </Badge>
                              {t.priority === 'urgent' && (
                                <Badge variant="danger" size="sm">
                                  Urgent
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1 hover:text-[#1F3B99] dark:hover:text-[#6D5BFF] text-gray-400 transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeletingTask(t)}
                                className="p-1 hover:text-rose-500 text-gray-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <div className="hidden sm:flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            <span>Task Title & Details</span>
            <span>Category & Priority</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 italic">
              No tasks match the selected filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((t) => {
                const isDone = t.status === 'completed';
                return (
                  <motion.div
                    key={t.id}
                    layout
                    className="p-3.5 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-gray-100/70 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                          isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          {t.mit && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                              ★ MIT
                            </span>
                          )}
                          {t.eventId && (() => {
                            const linkedEvt = events.find((e) => e.id === t.eventId);
                            return linkedEvt ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0 flex items-center gap-1">
                                📅 {linkedEvt.title}
                              </span>
                            ) : null;
                          })()}
                        </div>

                        {t.description && (
                          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate max-w-md">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={t.category === 'Client' ? 'purple' : t.category === 'Research' ? 'info' : 'secondary'} size="sm">
                          {t.category}
                        </Badge>

                        <Badge
                          variant={
                            t.priority === 'urgent'
                              ? 'danger'
                              : t.priority === 'high'
                              ? 'warning'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {t.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-700 shrink-0">
                        <button
                          onClick={async () => {
                            try {
                              const eventId = `event_task_${t.id}_${Date.now()}`;
                              await db.events.add({
                                id: eventId,
                                title: `🎯 ${t.title}`,
                                description: `Task time block: ${t.description || 'No description provided'}`,
                                startDate: t.dueDate,
                                endDate: t.dueDate,
                                startTime: t.time || '10:00',
                                endTime: t.time ? `${parseInt(t.time.split(':')[0]) + 1}:00` : '11:00',
                                color: '#1F3B99',
                                category: t.category,
                                taskId: t.id,
                              });
                              setScheduledToast(`✓ Task "${t.title.slice(0, 20)}" scheduled on Calendar!`);
                              setTimeout(() => setScheduledToast(null), 2500);
                            } catch (err) {
                              console.error('Error scheduling event:', err);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Schedule Task on Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-gray-400 hover:text-orbit-blue rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTask(t)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Task Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <Input
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={formCategory}
                onValueChange={(val) => setFormCategory(val as Category)}
                options={[
                  { value: 'Client', label: 'Client' },
                  { value: 'Research', label: 'Research' },
                  { value: 'Career', label: 'Career' },
                  { value: 'Personal', label: 'Personal' },
                  { value: 'College', label: 'College' },
                  { value: 'Habit', label: 'Habit' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <Select
                value={formPriority}
                onValueChange={(val) => setFormPriority(val as Priority)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Link to Calendar Event (Optional - Next 7 Days)
            </label>
            <Select
              value={formEventId}
              onValueChange={(val) => setFormEventId(val)}
              options={[
                { value: '', label: '-- No Calendar Event (Standalone Task) --' },
                ...(() => {
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const limitDate = new Date(now);
                  limitDate.setDate(now.getDate() + 7);
                  const limitStr = limitDate.toISOString().split('T')[0];
                  const todayIso = new Date().toISOString().split('T')[0];

                  const upcoming = events
                    .filter((e) => e.startDate >= todayIso && e.startDate <= limitStr)
                    .sort((a, b) => {
                      const dComp = a.startDate.localeCompare(b.startDate);
                      if (dComp !== 0) return dComp;
                      return (a.startTime || '').localeCompare(b.startTime || '');
                    });

                  return upcoming.map((evt) => ({
                    value: evt.id,
                    label: `📅 ${evt.startDate} ${evt.startTime ? `@ ${evt.startTime}` : ''} — ${evt.title}`,
                  }));
                })(),
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                value={formStatus}
                onValueChange={(val) => setFormStatus(val as TaskStatus)}
                options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <DatePicker
                value={formDueDate}
                onChange={(val) => setFormDueDate(val)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask(deletingTask.id);
            setDeletingTask(null);
          }
        }}
        title="Delete Task"
        itemName={deletingTask?.title}
        message="Are you sure you want to delete this task? It will be removed permanently."
      />
    </div>
  );
}
