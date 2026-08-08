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
import { Task, Priority, TaskStatus, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverCol, setDraggedOverCol] = useState<TaskStatus | null>(null);

  const {
    tasks,
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

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formCategory, setFormCategory] = useState<Category>('Personal');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formEstHours, setFormEstHours] = useState<number>(1);
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter tasks logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormCategory('Personal');
    setFormProjectId('');
    setFormEstHours(1);
    setFormDueDate(new Date().toISOString().split('T')[0]);
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
                    ? 'bg-white dark:bg-gray-900 text-[#1F3B99] dark:text-[#6D5BFF] shadow-xs'
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
                    ? 'bg-white dark:bg-gray-900 text-[#1F3B99] dark:text-[#6D5BFF] shadow-xs'
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
      >
        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Categories</option>
            <option value="Client Work">Client Work</option>
            <option value="Research">Research</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Habit">Habit</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </PageHeader>

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

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1 hover:text-[#1F3B99] dark:hover:text-[#6D5BFF] text-gray-400 transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteTask(t.id)}
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
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-gray-400 hover:text-[#1F3B99] dark:hover:text-[#6D5BFF] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
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
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="Client">Client</option>
                <option value="Research">Research</option>
                <option value="Career">Career</option>
                <option value="Personal">Personal</option>
                <option value="College">College</option>
                <option value="Habit">Habit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              {editingTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
