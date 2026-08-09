'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  Kanban,
  ListCheck,
  TrendingUp,
  Bug,
  Sparkles,
  Calendar as CalendarIcon,
  Video,
  RefreshCw,
  UserCheck,
  DollarSign,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Grid,
  List,
  FolderPlus,
  Inbox,
  Tag,
  Edit,
  Trash2,
  MapPin,
  FileText,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { CalendarEvent, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { PageHeader } from '../../components/ui/PageHeader';

export default function ClientsPage() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    toggleFeature,
    addFeature,
    addBug,
    updateBugStatus,
    addProject,
  } = useProjectStore();

  const { tasks, toggleTaskStatus } = useTaskStore();
  const { events, loadFromDB, updateEvent, deleteEvent } = useCalendarStore();
  const { session, signIn, syncState, syncNow } = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [calViewMode, setCalViewMode] = useState<'week' | 'month' | 'agenda'>('week');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal & Selection States
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [isEventEditModalOpen, setIsEventEditModalOpen] = useState(false);

  // Edit Event Form States
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventStartTime, setEditEventStartTime] = useState('');
  const [editEventEndTime, setEditEventEndTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventCategory, setEditEventCategory] = useState<Category>('Client');

  // Form states for Project & Bugs
  const [newFeatureText, setNewFeatureText] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);

  // New Project Form
  const [projName, setProjName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projEstHours, setProjEstHours] = useState(60);
  const [projTechStack, setProjTechStack] = useState('Next.js, TypeScript, TailwindCSS');

  useEffect(() => {
    loadFromDB();
  }, []);

  const isSyncing = syncState === 'syncing';
  const isGoogleLinked = !!session;

  // Filter Google Calendar Events & Tasks for Client Work
  const clientEvents = events.filter(
    (e) =>
      e.category === 'Client' ||
      (e.title && e.title.toLowerCase().includes('client')) ||
      (e.description && e.description.toLowerCase().includes('client'))
  );

  const clientTasks = tasks.filter(
    (t) => t.category === 'Client' || t.tags?.includes('client')
  );

  const activeProject = projects.find((p) => p.id === activeTab);

  // Calendar Navigation
  const currDate = new Date(selectedDateStr);

  const handlePrevDate = () => {
    if (calViewMode === 'month') {
      setSelectedDateStr(format(subMonths(currDate, 1), 'yyyy-MM-dd'));
    } else {
      setSelectedDateStr(format(subDays(currDate, 7), 'yyyy-MM-dd'));
    }
  };

  const handleNextDate = () => {
    if (calViewMode === 'month') {
      setSelectedDateStr(format(addMonths(currDate, 1), 'yyyy-MM-dd'));
    } else {
      setSelectedDateStr(format(addDays(currDate, 7), 'yyyy-MM-dd'));
    }
  };

  // Event Details & Edit Handlers
  const handleOpenEventDetail = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setIsEventDetailModalOpen(true);
  };

  const handleOpenEventEdit = () => {
    if (!selectedEvent) return;
    setEditEventTitle(selectedEvent.title);
    setEditEventDate(selectedEvent.startDate);
    setEditEventStartTime(selectedEvent.startTime || '09:00');
    setEditEventEndTime(selectedEvent.endTime || '10:00');
    setEditEventLocation(selectedEvent.location || '');
    setEditEventDescription(selectedEvent.description || '');
    setEditEventCategory(selectedEvent.category || 'Client');
    setIsEventDetailModalOpen(false);
    setIsEventEditModalOpen(true);
  };

  const handleSaveEditedEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !editEventTitle.trim()) return;

    await updateEvent(selectedEvent.id, {
      title: editEventTitle.trim(),
      startDate: editEventDate,
      endDate: editEventDate,
      startTime: editEventStartTime,
      endTime: editEventEndTime,
      location: editEventLocation.trim(),
      description: editEventDescription.trim(),
      category: editEventCategory,
    });

    setIsEventEditModalOpen(false);
    setSelectedEvent(null);
  };

  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setEventToDelete(selectedEvent);
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim() || !activeProject) return;
    addFeature(activeProject.id, newFeatureText.trim());
    setNewFeatureText('');
  };

  const handleAddBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !activeProject) return;
    addBug(activeProject.id, {
      title: bugTitle.trim(),
      severity: bugSeverity,
      status: 'open',
    });
    setBugTitle('');
    setIsBugModalOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const techArray = projTechStack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addProject({
      name: projName.trim(),
      clientName: clientName.trim() || 'Client Workspace',
      description: projDesc.trim() || 'Client project deliverables and feature roadmap',
      status: 'active',
      progress: 0,
      estimatedHours: Number(projEstHours) || 50,
      actualHours: 0,
      deadline: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      features: [],
      bugs: [],
      techStack: techArray.length > 0 ? techArray : ['Next.js', 'TypeScript'],
    });

    setProjName('');
    setClientName('');
    setProjDesc('');
    setIsProjModalOpen(false);
  };

  // Calendar dates generation
  const weekStart = startOfWeek(currDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        icon={Briefcase}
        iconBgColor="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
        title="Client Projects & Work Center"
        badgeText={`${projects.length} Projects`}
        badgeVariant="purple"
        subtitle="Track client projects, sync Google Calendar work schedule, and manage deliverables"
        actions={
          <>
            <button
              onClick={isGoogleLinked ? syncNow : signIn}
              disabled={isSyncing}
              className="btn-secondary px-3 sm:px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
            </button>
            <button
              onClick={() => setIsProjModalOpen(true)}
              className="btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </>
        }
      >
        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll max-w-full pb-1 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'all'
                ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>All Client Work</span>
          </button>

          {projects.map((proj) => {
            const isSel = activeTab === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => setActiveTab(proj.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 ${
                  isSel
                    ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{proj.name}</span>
                <span className="text-[10px] opacity-80 shrink-0">({proj.clientName || `${proj.progress}%`})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsProjModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Add Project</span>
          </button>
        </div>
      </PageHeader>

      {/* ALL CLIENT WORK VIEW (CALENDAR SCHEDULE) */}
      {activeTab === 'all' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between min-h-[96px] sm:min-h-0">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate block">Active Projects</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{projects.length}</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                {projects.length > 0 ? `${projects.filter((p) => p.status === 'active').length} Active` : 'No projects'}
              </p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between min-h-[96px] sm:min-h-0">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate block">Synced Events</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{clientEvents.length}</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 shrink-0">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Google Calendar</p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between min-h-[96px] sm:min-h-0">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate block">Tasks Logged</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{clientTasks.length}</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                {clientTasks.filter((t) => t.status === 'completed').length} Completed
              </p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between min-h-[96px] sm:min-h-0">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate block">Work Hours</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {projects.reduce((a, b) => a + (b.actualHours || 0), 0)}h
                </span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                Est: {projects.reduce((a, b) => a + (b.estimatedHours || 0), 0)}h Total
              </p>
            </div>
          </div>

          {/* Interactive Client Work Calendar View */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarIcon className="w-5 h-5 text-[#1F3B99] dark:text-[#6D5BFF] shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    Client Work Calendar Schedule
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                    Live schedule of Google Calendar client events & client tasks
                  </p>
                </div>
              </div>

              {/* View Mode & Date Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setCalViewMode('week')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      calViewMode === 'week'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalViewMode('agenda')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      calViewMode === 'agenda'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Agenda Feed
                  </button>
                </div>

                <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shrink-0">
                  <button
                    onClick={handlePrevDate}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 px-1.5 sm:px-2">
                    {format(currDate, 'MMM yyyy')}
                  </span>
                  <button
                    onClick={handleNextDate}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Week View Grid */}
            {calViewMode === 'week' && (
              <div className="w-full overflow-x-auto touch-scroll no-scrollbar pb-2">
                <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                  {weekDays.map((day, idx) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayEvents = clientEvents.filter((e) => e.startDate === dayStr);
                    const dayTasks = clientTasks.filter((t) => t.dueDate === dayStr);
                    const isTodayDay = isToday(day);

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border min-h-[220px] space-y-2 flex flex-col justify-between ${
                          isTodayDay
                            ? 'bg-blue-50/50 dark:bg-blue-950/20 border-[#1F3B99] dark:border-[#6D5BFF]'
                            : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-gray-400">
                            {format(day, 'EEE')}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                              isTodayDay
                                ? 'bg-[#1F3B99] dark:bg-[#6D5BFF] text-white'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {format(day, 'd')}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[160px]">
                          {dayEvents.map((evt) => (
                            <div
                              key={evt.id}
                              onClick={() => handleOpenEventDetail(evt)}
                              className="p-2 rounded-xl bg-purple-600 text-white text-[11px] font-bold space-y-0.5 shadow-xs cursor-pointer hover:scale-[1.02] transition-transform"
                            >
                              <div className="flex items-center gap-1">
                                <Video className="w-3 h-3 shrink-0" />
                                <span className="truncate">{evt.title}</span>
                              </div>
                              {evt.startTime && (
                                <span className="text-[9px] opacity-80 block">
                                  {evt.startTime} - {evt.endTime || 'End'}
                                </span>
                              )}
                            </div>
                          ))}

                          {dayTasks.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => toggleTaskStatus(t.id)}
                              className={`p-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                                t.status === 'completed'
                                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 line-through border-transparent'
                                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">{t.title}</span>
                              </div>
                            </div>
                          ))}

                          {dayEvents.length === 0 && dayTasks.length === 0 && (
                            <span className="text-[10px] text-gray-400 italic block text-center pt-6">
                              No entries
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agenda View Feed */}
            {calViewMode === 'agenda' && (
              <div className="space-y-3">
                {clientEvents.length === 0 && clientTasks.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                    <Inbox className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      No Google Calendar client events or client tasks logged yet.
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Sync Google Calendar or create a new client task to see it in your agenda!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => handleOpenEventDetail(evt)}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 dark:text-white block">
                              {evt.title}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {evt.startDate} {evt.startTime ? `• ${evt.startTime} - ${evt.endTime}` : ''}
                            </span>
                          </div>
                        </div>
                        <Badge variant="purple" size="sm">
                          Google Event
                        </Badge>
                      </div>
                    ))}

                    {clientTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTaskStatus(t.id)}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                              t.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : 'border border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {t.status === 'completed' && '✓'}
                          </div>
                          <div>
                            <span
                              className={`font-extrabold block ${
                                t.status === 'completed'
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {t.title}
                            </span>
                            <span className="text-[10px] text-gray-400">Due: {t.dueDate}</span>
                          </div>
                        </div>
                        <Badge variant={t.priority === 'urgent' ? 'danger' : 'primary'} size="sm">
                          {t.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL CLIENT PROJECT TAB VIEW */}
      {activeTab !== 'all' && activeProject && (
        <div className="space-y-6">
          {/* Selected Project Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F3B99] dark:text-[#6D5BFF]">
                    {activeProject.clientName}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    {activeProject.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{activeProject.description}</p>
                </div>
                <Badge variant="success" size="md">
                  {activeProject.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {activeProject.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Deadline</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {activeProject.deadline}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Est. vs Spent</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {activeProject.actualHours}h / {activeProject.estimatedHours}h
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Open Bugs</span>
                  <span className="text-sm font-extrabold text-rose-500">
                    {activeProject.bugs.filter((b) => b.status !== 'resolved').length} Bugs
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Progress Widget */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <CircularProgress
                percentage={activeProject.progress}
                size={130}
                strokeWidth={12}
                color="#1F3B99"
                label="Completion"
              />
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Project Completion: {activeProject.progress}%
                </h4>
                <p className="text-xs text-gray-400">
                  {activeProject.features.filter((f) => f.completed).length} of {activeProject.features.length} features shipped
                </p>
              </div>
            </div>
          </div>

          {/* Features Roadmap & Bug Tracker Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Roadmap Scope */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListCheck className="w-5 h-5 text-[#1F3B99] dark:text-[#6D5BFF]" />
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Feature Scope & Roadmap
                  </h3>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {activeProject.features.filter((f) => f.completed).length}/{activeProject.features.length} Done
                </span>
              </div>

              <form onSubmit={handleAddFeature} className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Add new feature requirement..."
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                />
                <button type="submit" className="btn-secondary px-3 py-2 rounded-xl text-xs">
                  Add Feature
                </button>
              </form>

              <div className="space-y-2">
                {activeProject.features.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No features defined yet. Add a feature requirement above!</p>
                ) : (
                  activeProject.features.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => toggleFeature(activeProject.id, f.id)}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                            f.completed ? 'bg-[#1F3B99] text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {f.completed && '✓'}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            f.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {f.title}
                        </span>
                      </div>
                      <Badge variant={f.completed ? 'success' : 'outline'} size="sm">
                        {f.completed ? 'Shipped' : 'Pending'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bug Tracker List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-rose-500" />
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Bug Tracker & Issues
                  </h3>
                </div>
                <button
                  onClick={() => setIsBugModalOpen(true)}
                  className="btn-secondary px-3 py-1.5 rounded-xl text-xs"
                >
                  + Report Bug
                </button>
              </div>

              <div className="space-y-2">
                {activeProject.bugs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No bugs reported for this project!</p>
                ) : (
                  activeProject.bugs.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          {b.title}
                        </span>
                        <Badge variant={b.severity === 'high' || b.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                          {b.severity} severity
                        </Badge>
                      </div>

                      <select
                        value={b.status}
                        onChange={(e) => updateBugStatus(activeProject.id, b.id, e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      <Modal
        isOpen={isEventDetailModalOpen}
        onClose={() => {
          setIsEventDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        title="Calendar Event Details"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F3B99] dark:text-[#6D5BFF]">
                  {selectedEvent.category || 'Client'} Work Event
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                  {selectedEvent.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenEventEdit}
                  className="btn-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-b border-gray-100 dark:border-gray-800 py-3">
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-[#1F3B99] dark:text-[#6D5BFF] shrink-0" />
                <span className="font-semibold">
                  {selectedEvent.startDate} {selectedEvent.startTime ? `at ${selectedEvent.startTime}` : 'All Day'}
                  {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.syncStatus && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={selectedEvent.syncStatus === 'synced' ? 'success' : 'outline'}>
                    Status: {selectedEvent.syncStatus}
                  </Badge>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                <span className="font-extrabold text-gray-400 uppercase text-[10px] block">
                  Description / Agenda
                </span>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsEventDetailModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* EVENT EDIT MODAL */}
      <Modal
        isOpen={isEventEditModalOpen}
        onClose={() => setIsEventEditModalOpen(false)}
        title="Edit Calendar Event"
      >
        <form onSubmit={handleSaveEditedEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={editEventTitle}
              onChange={(e) => setEditEventTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={editEventDate}
              onChange={(e) => setEditEventDate(e.target.value)}
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
                value={editEventStartTime}
                onChange={(e) => setEditEventStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={editEventEndTime}
                onChange={(e) => setEditEventEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Location / Meeting Link
            </label>
            <input
              type="text"
              value={editEventLocation}
              onChange={(e) => setEditEventLocation(e.target.value)}
              placeholder="Add location or Google Meet link"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editEventDescription}
              onChange={(e) => setEditEventDescription(e.target.value)}
              placeholder="Add notes or agenda..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEventEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* BUG REPORT MODAL */}
      <Modal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} title="Report Bug for Project">
        <form onSubmit={handleAddBug} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bug Description *
            </label>
            <input
              type="text"
              required
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              placeholder="e.g. Stripe webhook timeout on checkout"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              value={bugSeverity}
              onChange={(e) => setBugSeverity(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsBugModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs">
              Submit Bug
            </button>
          </div>
        </form>
      </Modal>

      {/* NEW CLIENT PROJECT MODAL */}
      <Modal isOpen={isProjModalOpen} onClose={() => setIsProjModalOpen(false)} title="Create New Client Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              placeholder="e.g. Sanab Enterprise Portal"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Client Name / Organization
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Sanab Health Solutions"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="Provide key project requirements & scope details..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={projEstHours}
                onChange={(e) => setProjEstHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={projTechStack}
                onChange={(e) => setProjTechStack(e.target.value)}
                placeholder="Next.js, TypeScript, PostgreSQL"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsProjModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs">
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={async () => {
          if (eventToDelete) {
            await deleteEvent(eventToDelete.id);
            setIsEventDetailModalOpen(false);
            setSelectedEvent(null);
            setEventToDelete(null);
          }
        }}
        title="Delete Event"
        itemName={eventToDelete?.title}
        message="Are you sure you want to delete this event? It will be removed permanently."
      />
    </div>
  );
}
