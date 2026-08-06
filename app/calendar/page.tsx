'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { CalendarEvent, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function CalendarPage() {
  const { events, selectedDate, viewMode, addEvent, deleteEvent, setSelectedDate, setViewMode } = useCalendarStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<Category>('Client');
  const [color, setColor] = useState('#3b82f6');

  const currDate = new Date(selectedDate);

  const handlePrev = () => {
    const d = new Date(currDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(currDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const weekStart = startOfWeek(currDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      startDate: date,
      endDate: date,
      startTime,
      endTime,
      category,
      color,
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Interactive Calendar & Time Blocking
              </h1>
              <p className="text-xs text-gray-500">
                {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Nav Arrows */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View switcher */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold">
              {(['week', 'month', 'agenda'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    viewMode === m
                      ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const dayEvents = events.filter((e) => e.startDate === dayStr);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border min-h-[300px] space-y-3 transition-colors ${
                    isToday
                      ? 'bg-blue-50/20 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                      : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`text-lg font-extrabold inline-block mt-0.5 ${
                        isToday
                          ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.map((evt) => (
                      <motion.div
                        key={evt.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-2.5 rounded-xl text-white text-xs font-bold shadow-xs relative group cursor-pointer"
                        style={{ backgroundColor: evt.color || '#3b82f6' }}
                      >
                        <span className="block truncate">{evt.title}</span>
                        {evt.startTime && (
                          <span className="text-[10px] opacity-80 block font-normal mt-0.5">
                            {evt.startTime} - {evt.endTime}
                          </span>
                        )}
                        <button
                          onClick={() => deleteEvent(evt.id)}
                          className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 text-white text-[10px] hover:bg-black/20 px-1.5 py-0.5 rounded"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {(viewMode === 'agenda' || viewMode === 'month') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
            Upcoming Schedule & Agenda
          </h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: evt.color }} />
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block">
                      {evt.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {evt.startDate} • {evt.startTime} - {evt.endTime}
                    </span>
                  </div>
                </div>
                <Badge variant="outline">{evt.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Calendar Event">
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
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
