'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Tag,
  CheckCircle2,
  CalendarDays,
  Grid,
  List,
  Filter,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Edit,
  Trash2,
  MapPin,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useTaskStore } from '../../store/useTaskStore';
import { CalendarEvent, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { Button } from '../../components/ui/button';

import { PageHeader } from '../../components/ui/PageHeader';

const HOUR_HEIGHT = 60; // 60px per hour = 1px per minute

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  colIndex: number;
  totalCols: number;
}

function getPositionedDayEvents(dayEvents: CalendarEvent[]): PositionedEvent[] {
  const parsed = dayEvents.map((evt) => {
    let startMins = 9 * 60;
    if (evt.startTime) {
      const parts = evt.startTime.split(':').map(Number);
      if (!isNaN(parts[0])) {
        startMins = parts[0] * 60 + (parts[1] || 0);
      }
    }

    let endMins = startMins + 60;
    if (evt.endTime) {
      const parts = evt.endTime.split(':').map(Number);
      if (!isNaN(parts[0])) {
        const computedEnd = parts[0] * 60 + (parts[1] || 0);
        if (computedEnd > startMins) {
          endMins = computedEnd;
        }
      }
    }

    const top = (startMins / 60) * HOUR_HEIGHT;
    const duration = endMins - startMins;
    const height = Math.max((duration / 60) * HOUR_HEIGHT, 28);

    return { evt, startMins, endMins, top, height };
  });

  parsed.sort((a, b) => a.startMins - b.startMins || (b.endMins - b.startMins) - (a.endMins - a.startMins));

  const results: PositionedEvent[] = [];
  let currentGroup: typeof parsed = [];
  let groupEnd = 0;

  const processGroup = (group: typeof parsed) => {
    if (group.length === 0) return;
    const columns: number[] = [];

    group.forEach((item) => {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= item.startMins) {
          columns[c] = item.endMins;
          results.push({
            event: item.evt,
            top: item.top,
            height: item.height,
            colIndex: c,
            totalCols: 1,
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push(item.endMins);
        results.push({
          event: item.evt,
          top: item.top,
          height: item.height,
          colIndex: columns.length - 1,
          totalCols: 1,
        });
      }
    });

    const maxCols = columns.length;
    results.forEach((res) => {
      if (group.some((g) => g.evt.id === res.event.id)) {
        res.totalCols = maxCols;
      }
    });
  };

  parsed.forEach((item) => {
    if (currentGroup.length === 0) {
      currentGroup.push(item);
      groupEnd = item.endMins;
    } else if (item.startMins < groupEnd) {
      currentGroup.push(item);
      if (item.endMins > groupEnd) groupEnd = item.endMins;
    } else {
      processGroup(currentGroup);
      currentGroup = [item];
      groupEnd = item.endMins;
    }
  });
  processGroup(currentGroup);

  return results;
}

import { CalendarSkeleton } from '../../components/ui/Skeleton';

export default function CalendarPage() {
  const { events, isLoading: isLoadingEvents, selectedDate, viewMode, addEvent, updateEvent, deleteEvent, setSelectedDate, setViewMode } = useCalendarStore();
  const { tasks } = useTaskStore();
  const { session, syncState, syncNow } = useGoogleAuth();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<Category>('Client');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const timelineScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCalendarStore.getState().loadFromDB();
  }, []);

  // Auto-scroll timeline to current time or 8am on mount / view change
  useEffect(() => {
    if (viewMode === 'day' && timelineScrollRef.current) {
      const now = new Date();
      const isSelectedToday = isToday(new Date(selectedDate));
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentTimeTop = (currentMinutes / 60) * 60;
      const targetScroll = isSelectedToday ? Math.max(0, currentTimeTop - 150) : 8 * 60;
      timelineScrollRef.current.scrollTop = targetScroll;
    }
  }, [viewMode, selectedDate]);

  if (isLoadingEvents) {
    return <CalendarSkeleton />;
  }

  const currDate = new Date(selectedDate);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      const d = subMonths(currDate, 1);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    } else if (viewMode === 'day') {
      const d = subDays(currDate, 1);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    } else {
      const d = subDays(currDate, 7);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      const d = addMonths(currDate, 1);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    } else if (viewMode === 'day') {
      const d = addDays(currDate, 1);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    } else {
      const d = addDays(currDate, 7);
      setSelectedDate(format(d, 'yyyy-MM-dd'));
    }
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Dates intervals
  const weekStart = startOfWeek(currDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const monthStart = startOfMonth(currDate);
  const monthEnd = endOfMonth(currDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  // Handle Event Click -> Open Detail Modal
  const handleEventClick = (evt: CalendarEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedEvent(evt);
    setIsDetailModalOpen(true);
  };

  // Handle Edit from Detail Modal
  const handleEditFromDetail = () => {
    if (!selectedEvent) return;
    setEditingEvent(selectedEvent);
    setTitle(selectedEvent.title);
    setDate(selectedEvent.startDate);
    setStartTime(selectedEvent.startTime || '10:00');
    setEndTime(selectedEvent.endTime || '11:00');
    setCategory(selectedEvent.category);
    setColor(selectedEvent.color || '#3b82f6');
    setDescription(selectedEvent.description || '');
    setLocation(selectedEvent.location || '');

    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const openCreateModalForDate = (dateStr: string) => {
    setEditingEvent(null);
    setDate(dateStr);
    setTitle('');
    setDescription('');
    setLocation('');
    setStartTime('10:00');
    setEndTime('11:00');
    setCategory('Client');
    setColor('#3b82f6');
    setIsFormModalOpen(true);
  };

  // Event submission (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: date,
        endDate: date,
        startTime,
        endTime,
        category,
        color,
      });
    } else {
      await addEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: date,
        endDate: date,
        startTime,
        endTime,
        category,
        color,
      });
    }

    setTitle('');
    setDescription('');
    setLocation('');
    setEditingEvent(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteFromDetail = async () => {
    if (!selectedEvent) return;
    setEventToDelete(selectedEvent);
  };

  // Category filter
  const filteredEvents = events.filter((e) => {
    if (activeCategoryFilter === 'all') return true;
    return e.category === activeCategoryFilter;
  });

  // 24 Hour Slots (12:00 AM to 11:00 PM)
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  // Helper for resilient date string matching
  const getEventDateStr = (sDate?: string) => {
    if (!sDate) return '';
    return sDate.split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <PageHeader
        icon={CalendarIcon}
        iconBgColor="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        title="Calendar & Events"
        badgeText={`${filteredEvents.length} Total`}
        badgeVariant="blue"
        subtitle="Google Calendar Sync & Productivity Schedule"
        actions={
          <>
            {session && (
              <button
                onClick={syncNow}
                disabled={syncState === 'syncing'}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncState === 'syncing' ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}

            <button
              onClick={() => openCreateModalForDate(selectedDate)}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white btn-primary flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </>
        }
      >
        {/* Date Navigation & View Mode Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            {/* Prev / Today / Next controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 sm:px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs font-extrabold text-gray-900 dark:text-white sm:hidden truncate">
              {format(currDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-around sm:justify-end p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg capitalize transition-all text-xs text-center ${
                  viewMode === m
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* Main Google Calendar Layout (Sidebar + Main Calendar Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Sidebar: Mini Month Picker & Category Filters */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Categories & Calendars Filter (Horizontal Scroll on Mobile, Vertical Stack on Desktop) */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-2.5 sm:space-y-3">
            <h3 className="font-extrabold text-[11px] sm:text-xs text-gray-900 dark:text-white uppercase tracking-wider px-1">
              My Calendars
            </h3>
            <div className="flex lg:flex-col items-center lg:items-stretch gap-1.5 overflow-x-auto no-scrollbar touch-scroll max-w-full pb-1 lg:pb-0 text-xs font-semibold">
              {[
                { name: 'all', label: 'All Calendars', color: '#3b82f6' },
                { name: 'Client', label: 'Client Work', color: '#8b5cf6' },
                { name: 'Research', label: 'Research', color: '#3b82f6' },
                { name: 'Career', label: 'Career', color: '#10b981' },
                { name: 'Personal', label: 'Personal', color: '#f59e0b' },
              ].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategoryFilter(cat.name)}
                  className={`px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-colors shrink-0 ${
                    activeCategoryFilter === cat.name
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-white font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {activeCategoryFilter === cat.name && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 hidden lg:block" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Calendar Picker (Collapsible / Compact on Mobile) */}
          <div className="hidden lg:block p-4 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-gray-900 dark:text-white px-1">
              <span>{format(currDate, 'MMMM yyyy')}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedDate(format(subMonths(currDate, 1), 'yyyy-MM-dd'))}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedDate(format(addMonths(currDate, 1), 'yyyy-MM-dd'))}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>

            {/* Mini Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
              {monthDays.slice(0, 35).map((d, i) => {
                const isSelected = isSameDay(d, currDate);
                const isCurrentMonth = isSameMonth(d, currDate);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(format(d, 'yyyy-MM-dd'))}
                    className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : isToday(d)
                        ? 'border border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                        : isCurrentMonth
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    {format(d, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Grid Area */}
        <div className="lg:col-span-9">
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4 overflow-x-auto no-scrollbar touch-scroll">
              <div className="grid grid-cols-7 gap-2 min-w-[680px]">
                {weekDays.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrentDay = isToday(day);
                  const dayEvents = filteredEvents.filter((e) => getEventDateStr(e.startDate) === dayStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => openCreateModalForDate(dayStr)}
                      className={`p-2.5 rounded-2xl border min-h-[420px] space-y-2.5 cursor-pointer transition-all ${
                        isCurrentDay
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500'
                          : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="text-center pb-2 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {format(day, 'EEE')}
                        </span>
                        <span
                          className={`text-sm font-extrabold inline-flex items-center justify-center mt-0.5 ${
                            isCurrentDay
                              ? 'w-6 h-6 rounded-full bg-blue-600 text-white mx-auto'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>

                      {/* Day Event List */}
                      <div className="space-y-1.5">
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className="p-2 rounded-xl text-white text-[11px] font-bold relative group shadow-2xs cursor-pointer hover:brightness-110 transition-all min-w-0"
                            style={{ backgroundColor: evt.color || '#3b82f6' }}
                          >
                            <span className="block truncate">{evt.title}</span>
                            {evt.startTime && (
                              <span className="text-[9px] opacity-90 block font-semibold mt-0.5 truncate">
                                {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month View Grid */}
          {viewMode === 'month' && (
            <div className="p-4 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-2">
              {/* Header Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((d, i) => {
                  const dayStr = format(d, 'yyyy-MM-dd');
                  const dayEvents = filteredEvents.filter((e) => getEventDateStr(e.startDate) === dayStr);
                  const isCurrentMonth = isSameMonth(d, currDate);
                  const isCurrentDay = isToday(d);

                  return (
                    <div
                      key={i}
                      onClick={() => openCreateModalForDate(dayStr)}
                      className={`min-h-[95px] p-2 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isCurrentDay
                          ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-500'
                          : isCurrentMonth
                          ? 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-blue-400'
                          : 'bg-transparent border-transparent opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrentDay
                              ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {format(d, 'd')}
                        </span>
                      </div>

                      {/* Event Pills */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white truncate hover:brightness-110 transition-all cursor-pointer"
                            style={{ backgroundColor: evt.color || '#3b82f6' }}
                          >
                            {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] font-bold text-gray-400 block px-1">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day Hourly View (24-Hour Continuous Proportional Timeline) */}
          {viewMode === 'day' && (() => {
            const dayEvents = filteredEvents.filter((e) => getEventDateStr(e.startDate) === selectedDate);
            const positionedEvents = getPositionedDayEvents(dayEvents);
            const now = new Date();
            const isSelectedToday = isToday(currDate);
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;

            return (
              <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                      {format(currDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      24-Hour (12:00 AM – 11:59 PM)
                    </p>
                  </div>
                  <Badge variant="purple">{dayEvents.length} Events</Badge>
                </div>

                <div
                  ref={timelineScrollRef}
                  className="relative overflow-y-auto max-h-[680px] border border-gray-200 dark:border-gray-800/80 rounded-2xl bg-gray-50/30 dark:bg-gray-900/30 touch-scroll"
                >
                  <div className="relative min-w-[300px]" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                    {/* Hour Grid Lines & Labels (00:00 to 23:00) */}
                    {timeSlots.map((slot, hourIndex) => {
                      const topPos = hourIndex * HOUR_HEIGHT;
                      return (
                        <React.Fragment key={slot}>
                          <div
                            className="absolute left-0 right-0 flex items-center group cursor-pointer border-t border-gray-200/80 dark:border-gray-800/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                            style={{ top: `${topPos}px`, height: `${HOUR_HEIGHT}px` }}
                            onClick={() => {
                              setStartTime(slot);
                              setEndTime(`${String((hourIndex + 1) % 24).padStart(2, '0')}:00`);
                              openCreateModalForDate(selectedDate);
                            }}
                          >
                            <span className="w-14 shrink-0 text-[11px] font-bold font-mono text-gray-400 pl-3 select-none">
                              {slot}
                            </span>
                            <div className="flex-1 border-t border-gray-200/60 dark:border-gray-800/60 h-0" />
                          </div>

                          <div
                            className="absolute left-14 right-0 border-t border-dashed border-gray-200/40 dark:border-gray-800/40 pointer-events-none"
                            style={{ top: `${topPos + 30}px` }}
                          />
                        </React.Fragment>
                      );
                    })}

                    {/* Current Time Indicator Red Line */}
                    {isSelectedToday && (
                      <div
                        className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                        style={{ top: `${currentTimeTop}px` }}
                      >
                        <div className="w-14 flex items-center justify-end pr-1">
                          <span className="text-[9px] font-extrabold font-mono text-rose-500 bg-rose-50 dark:bg-rose-950 px-1 py-0.5 rounded-xs border border-rose-200 dark:border-rose-900">
                            {format(now, 'HH:mm')}
                          </span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.25 shrink-0 shadow-xs animate-pulse" />
                        <div className="flex-1 border-t-2 border-rose-500 shadow-xs" />
                      </div>
                    )}

                    {/* Positioned Events Blocks */}
                    <div className="absolute left-14 right-2 top-0 bottom-0 pointer-events-none">
                      {positionedEvents.map(({ event: evt, top, height, colIndex, totalCols }) => {
                        const widthPct = 100 / totalCols;
                        const leftPct = widthPct * colIndex;

                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className="absolute p-2 rounded-xl text-white shadow-sm border-l-4 border-white/40 cursor-pointer pointer-events-auto transition-all hover:scale-[1.01] hover:z-20 overflow-hidden flex flex-col justify-between"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: `calc(${leftPct}% + 4px)`,
                              width: `calc(${widthPct}% - 8px)`,
                              backgroundColor: evt.color || '#3b82f6',
                            }}
                            title={`${evt.title} (${evt.startTime || ''} - ${evt.endTime || ''})`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs truncate leading-tight">
                                  {evt.title}
                                </span>
                                {evt.category && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/20 shrink-0 hidden sm:inline-block">
                                    {evt.category}
                                  </span>
                                )}
                              </div>
                              {evt.startTime && (
                                <span className="text-[10px] opacity-90 font-mono font-semibold block truncate mt-0.5">
                                  {evt.startTime} {evt.endTime ? `– ${evt.endTime}` : ''}
                                </span>
                              )}
                            </div>

                            {height >= 50 && evt.location && (
                              <div className="text-[10px] opacity-85 truncate flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Agenda View */}
          {viewMode === 'agenda' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">
                Upcoming Schedule & Agenda
              </h3>

              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 italic">
                  No upcoming events scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => handleEventClick(evt)}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: evt.color }} />
                        <div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white block">
                            {evt.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {evt.startDate} • {evt.startTime || 'All Day'} {evt.endTime ? `- ${evt.endTime}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{evt.category}</Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(evt.id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color || '#3b82f6' }} />
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {selectedEvent.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="purple">{selectedEvent.category}</Badge>
                  {selectedEvent.googleEventId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      ● Google Synced
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditFromDetail}
                  className="btn-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteFromDetail}
                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Time and Date Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
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
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                <span className="font-extrabold text-gray-400 uppercase text-[10px] block">
                  Description
                </span>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Interlinked Tasks */}
            {(() => {
              const linkedTasks = tasks.filter((t) => t.eventId === selectedEvent.id || t.id === selectedEvent.taskId);
              if (linkedTasks.length === 0) return null;
              return (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-xs space-y-2">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase text-[10px] block flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                    Interlinked Tasks ({linkedTasks.length})
                  </span>
                  <div className="space-y-1.5">
                    {linkedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                      >
                        <span className={`font-medium ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {t.title}
                        </span>
                        <Badge variant={t.status === 'completed' ? 'success' : 'info'} size="sm">
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal (Create or Edit Event) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Calendar Event' : 'Create Google Calendar Event'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Event Title *
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title and time block"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <DatePicker
              value={date}
              onChange={(val) => setDate(val)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(val) => {
                  const cat = val as Category;
                  setCategory(cat);
                  const colorMap: Record<string, string> = {
                    Client: '#8b5cf6',
                    Research: '#3b82f6',
                    Career: '#10b981',
                    Personal: '#f59e0b',
                  };
                  setColor(colorMap[cat] || '#3b82f6');
                }}
                options={[
                  { value: 'Client', label: 'Client Work' },
                  { value: 'Research', label: 'Research & Thesis' },
                  { value: 'Career', label: 'Career & DSA' },
                  { value: 'Personal', label: 'Personal' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Color Tag
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 p-1 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location or Google Meet link"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or agenda..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsFormModalOpen(false);
                setEditingEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              {editingEvent ? 'Update Event' : 'Save Event'}
            </Button>
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
            setIsDetailModalOpen(false);
            setSelectedEvent(null);
            setEventToDelete(null);
          }
        }}
        title="Delete Calendar Event"
        itemName={eventToDelete?.title}
        message="Are you sure you want to delete this calendar event? It will be permanently removed."
      />
    </div>
  );
}
