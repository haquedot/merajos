'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTaskStore } from '../../store/useTaskStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Priority, Category } from '../../types';
import { CheckSquare, Calendar, FileText, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

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
      <div className="mb-4">
        <Tabs value={tab} onValueChange={(val) => setTab(val as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="task" className="flex-1">
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              Task
            </TabsTrigger>
            <TabsTrigger value="event" className="flex-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Calendar Event
            </TabsTrigger>
            <TabsTrigger value="note" className="flex-1">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Quick Note
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'task' && (
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <Input
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Refactor checkout API endpoint"
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
              className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={taskCategory}
                onValueChange={(val) => setTaskCategory(val as Category)}
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
                value={taskPriority}
                onValueChange={(val) => setTaskPriority(val as Priority)}
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
              value={taskEventId}
              onValueChange={setTaskEventId}
              options={[
                { value: '', label: '-- No Calendar Event (Standalone Task) --' },
                ...(() => {
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const limitDate = new Date(now);
                  limitDate.setDate(now.getDate() + 7);
                  const limitStr = limitDate.toISOString().split('T')[0];
                  const todayIso = new Date().toISOString().split('T')[0];

                  return events
                    .filter((e) => e.startDate >= todayIso && e.startDate <= limitStr)
                    .sort((a, b) => {
                      const dComp = a.startDate.localeCompare(b.startDate);
                      if (dComp !== 0) return dComp;
                      return (a.startTime || '').localeCompare(b.startTime || '');
                    })
                    .map((evt) => ({
                      value: evt.id,
                      label: `📅 ${evt.startDate} ${evt.startTime ? `@ ${evt.startTime}` : ''} — ${evt.title}`,
                    }));
                })(),
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <DatePicker
                value={taskDueDate}
                onChange={setTaskDueDate}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Time
              </label>
              <Input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Est. Hours
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={taskEstHours}
                onChange={(e) => setTaskEstHours(Number(e.target.value))}
              />
            </div>
          </div>

          {taskCategory === 'Client' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Link Client Project
              </label>
              <Select
                value={taskProjectId}
                onValueChange={setTaskProjectId}
                options={[
                  { value: '', label: '-- Select Project --' },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="mit-checkbox"
              checked={taskMit}
              onChange={(e) => setTaskMit(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="mit-checkbox" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
              Mark as Top 3 MIT (Most Important Task for Today)
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Task
            </Button>
          </div>
        </form>
      )}

      {tab === 'event' && (
        <form onSubmit={handleEventSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Event Title *
            </label>
            <Input
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Sanab Tech Sync"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <DatePicker
              value={eventDate}
              onChange={setEventDate}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Event
            </Button>
          </div>
        </form>
      )}

      {tab === 'note' && (
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Note Title *
            </label>
            <Input
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Thesis Sparse Attention Key Points"
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
              className="w-full px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] resize-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Note
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
