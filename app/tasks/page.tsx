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
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Task, Priority, TaskStatus, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'priority'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const boardColumns: { key: TaskStatus; label: string; color: string }[] = [
    { key: 'todo', label: 'To Do', color: 'border-blue-500' },
    { key: 'in_progress', label: 'In Progress', color: 'border-amber-500' },
    { key: 'completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Task Management & Board
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Organize, filter, track estimated hours, and prioritize all work items
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List View
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Kanban Board
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Categories</option>
            <option value="Client">Client</option>
            <option value="Research">Research</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="College">College</option>
            <option value="Habit">Habit</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
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
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
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
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:bg-gray-100/70 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          {t.mit && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                              ★ MIT
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xl truncate">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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

                      <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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

      {/* Kanban Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boardColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 min-h-[400px]"
              >
                <div className={`flex items-center justify-between pb-3 border-b-2 ${col.color}`}>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {col.label}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {colTasks.map((t) => (
                    <motion.div
                      key={t.id}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {t.title}
                        </span>
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`w-4 h-4 rounded-sm border shrink-0 ${
                            t.status === 'completed' ? 'bg-emerald-500 text-white' : 'border-gray-300'
                          }`}
                        />
                      </div>

                      {t.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                        <Badge variant="outline" size="sm">
                          {t.category}
                        </Badge>
                        <span>Due {t.dueDate}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {editingTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
