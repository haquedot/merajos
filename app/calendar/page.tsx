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
import { CalendarEvent, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

export default function CalendarPage() {
  const { events, selectedDate, viewMode, addEvent, updateEvent, deleteEvent, setSelectedDate, setViewMode } = useCalendarStore();
  const { session, syncState, syncNow } = useGoogleAuth();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<Category>('Client');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    useCalendarStore.getState().loadFromDB();
  }, []);

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
    if (confirm(`Are you sure you want to delete "${selectedEvent.title}"?`)) {
      await deleteEvent(selectedEvent.id);
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Category filter
  const filteredEvents = events.filter((e) => {
    if (activeCategoryFilter === 'all') return true;
    return e.category === activeCategoryFilter;
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  ];

  // Helper for resilient date string matching
  const getEventDateStr = (sDate?: string) => {
    if (!sDate) return '';
    return sDate.split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Calendar & Events
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  {filteredEvents.length} Total
                </span>
              </h1>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                Google Calendar Sync & Productivity Schedule
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sync Button */}
            {session && (
              <button
                onClick={syncNow}
                disabled={syncState === 'syncing'}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncState === 'syncing' ? 'Syncing...' : 'Sync Calendar'}</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
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

            {/* View Switcher */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700">
              {(['day', 'week', 'month', 'agenda'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    viewMode === m
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => openCreateModalForDate(selectedDate)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Google Calendar Layout (Sidebar + Main Calendar Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Mini Month Picker & Category Filters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mini Calendar Picker */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-3">
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

          {/* Categories & Calendars Filter */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
              My Calendars
            </h3>
            <div className="space-y-1.5 text-xs font-semibold">
              {[
                { name: 'all', label: 'All Calendars', color: '#3b82f6' },
                { name: 'Client', label: 'Client Work', color: '#8b5cf6' },
                { name: 'Research', label: 'Research & Thesis', color: '#3b82f6' },
                { name: 'Career', label: 'Career & DSA', color: '#10b981' },
                { name: 'Personal', label: 'Personal', color: '#f59e0b' },
              ].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategoryFilter(cat.name)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    activeCategoryFilter === cat.name
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.label}</span>
                  </div>
                  {activeCategoryFilter === cat.name && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Grid Area */}
        <div className="lg:col-span-9">
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="p-4 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {weekDays.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrentDay = isToday(day);
                  const dayEvents = filteredEvents.filter((e) => getEventDateStr(e.startDate) === dayStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => openCreateModalForDate(dayStr)}
                      className={`p-3 rounded-2xl border min-h-[450px] space-y-3 cursor-pointer transition-all ${
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
                          className={`text-base font-extrabold inline-flex items-center justify-center mt-0.5 ${
                            isCurrentDay
                              ? 'w-7 h-7 rounded-full bg-blue-600 text-white mx-auto'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>

                      {/* Day Event List */}
                      <div className="space-y-2">
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className="p-2.5 rounded-xl text-white text-xs font-bold relative group shadow-2xs cursor-pointer hover:brightness-110 transition-all"
                            style={{ backgroundColor: evt.color || '#3b82f6' }}
                          >
                            <span className="block truncate">{evt.title}</span>
                            {evt.startTime && (
                              <span className="text-[10px] opacity-90 block font-semibold mt-0.5">
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

          {/* Day Hourly View */}
          {viewMode === 'day' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {format(currDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <Badge variant="purple">{filteredEvents.filter((e) => getEventDateStr(e.startDate) === selectedDate).length} Events Today</Badge>
              </div>

              <div className="space-y-2">
                {timeSlots.map((slot) => {
                  const slotEvents = filteredEvents.filter(
                    (e) => getEventDateStr(e.startDate) === selectedDate && e.startTime?.startsWith(slot.substring(0, 2))
                  );

                  return (
                    <div
                      key={slot}
                      onClick={() => {
                        setStartTime(slot);
                        openCreateModalForDate(selectedDate);
                      }}
                      className="flex items-start gap-4 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-bold font-mono text-gray-400 w-12 pt-1">{slot}</span>
                      <div className="flex-1 min-h-[36px] flex flex-wrap gap-2">
                        {slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className="p-2 rounded-xl text-white text-xs font-bold shadow-xs flex items-center justify-between min-w-[200px] cursor-pointer hover:brightness-110 transition-all"
                            style={{ backgroundColor: evt.color || '#3b82f6' }}
                          >
                            <span>{evt.title}</span>
                            <span className="text-[10px] opacity-90">{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title and time block"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as Category;
                  setCategory(cat);
                  const colorMap: Record<string, string> = {
                    Client: '#8b5cf6',
                    Research: '#3b82f6',
                    Career: '#10b981',
                    Personal: '#f59e0b',
                  };
                  setColor(colorMap[cat] || '#3b82f6');
                }}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="Client">Client Work</option>
                <option value="Research">Research & Thesis</option>
                <option value="Career">Career & DSA</option>
                <option value="Personal">Personal</option>
              </select>
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
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or agenda..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsFormModalOpen(false);
                setEditingEvent(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              {editingEvent ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
