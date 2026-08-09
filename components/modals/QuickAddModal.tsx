'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTaskStore } from '../../store/useTaskStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Priority, Category, TaskStatus, RecurringOption } from '../../types';
import { CheckSquare, Calendar, FileText, Sparkles } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'task' | 'event' | 'note'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskCategory, setTaskCategory] = useState<Category>('Personal');
  const [taskProjectId, setTaskProjectId] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('');
  const [taskEstHours, setTaskEstHours] = useState<number>(1);
  const [taskEventId, setTaskEventId] = useState<string>('');
  const [taskMit, setTaskMit] = useState(false);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<Category>('Client');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const { addTask } = useTaskStore();
  const { events, addEvent } = useCalendarStore();
  const { addNote } = useNotesStore();
  const { projects } = useProjectStore();

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let timeSlot: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon';
    if (taskTime) {
      const h = parseInt(taskTime.split(':')[0], 10);
      if (h >= 6 && h < 12) timeSlot = 'morning';
      else if (h >= 12 && h < 17) timeSlot = 'afternoon';
      else if (h >= 17 && h < 21) timeSlot = 'evening';
      else timeSlot = 'night';
    }

    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      priority: taskPriority,
      status: 'todo',
      category: taskCategory,
      projectId: taskProjectId || undefined,
      eventId: taskEventId || undefined,
      dueDate: taskDueDate,
      time: taskTime || undefined,
      timeSlot,
      estimatedHours: Number(taskEstHours) || 1,
      actualHours: 0,
      recurring: 'none',
      tags: [taskCategory],
      mit: taskMit,
    });

    setTaskTitle('');
    setTaskDesc('');
    onClose();
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addEvent({
      title: eventTitle.trim(),
      startDate: eventDate,
      endDate: eventDate,
      startTime: eventStart,
      endTime: eventEnd,
      category: eventCategory,
      color: '#3b82f6',
    });

    setEventTitle('');
    onClose();
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    addNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: 'General',
    });

    setNoteTitle('');
    setNoteContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Capture & Create" maxWidth="lg">
      <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => setTab('task')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'task'
              ? 'bg-white dark:bg-gray-900 text-[#1F3B99] dark:text-[#6D5BFF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Task
        </button>
        <button
          onClick={() => setTab('event')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'event'
              ? 'bg-white dark:bg-gray-900 text-[#1F3B99] dark:text-[#6D5BFF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Calendar Event
        </button>
        <button
          onClick={() => setTab('note')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'note'
              ? 'bg-white dark:bg-gray-900 text-[#1F3B99] dark:text-[#6D5BFF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Quick Note
        </button>
      </div>

      {tab === 'task' && (
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Refactor checkout API endpoint"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Add additional details or subtasks..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as Category)}
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
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Link to Calendar Event (Optional - Next 7 Days)
            </label>
            <select
              value={taskEventId}
              onChange={(e) => setTaskEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <option value="">-- No Calendar Event (Standalone Task) --</option>
              {(() => {
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

                return upcoming.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    📅 {evt.startDate} {evt.startTime ? `@ ${evt.startTime}` : ''} — {evt.title}
                  </option>
                ));
              })()}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={taskEstHours}
                onChange={(e) => setTaskEstHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {taskCategory === 'Client' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Link Client Project
              </label>
              <select
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="mit-checkbox"
              checked={taskMit}
              onChange={(e) => setTaskMit(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="mit-checkbox" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              Mark as Top 3 MIT (Most Important Task for Today)
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {tab === 'event' && (
        <form onSubmit={handleEventSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Sanab Tech Sync"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Add Event
            </button>
          </div>
        </form>
      )}

      {tab === 'note' && (
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Thesis Sparse Attention Key Points"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note content here..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
