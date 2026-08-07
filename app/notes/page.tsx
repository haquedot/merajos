'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Folder,
  Sparkles,
  Brain,
  Edit,
  Check,
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { Note } from '../../types';
import { Badge } from '../../components/ui/Badge';

export default function NotesPage() {
  const {
    notes,
    activeNoteId,
    searchQuery,
    selectedCategory,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    setActiveNoteId,
    setSearchQuery,
    setSelectedCategory,
  } = useNotesStore();

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newId = addNote({
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing your Markdown content here...',
      category: 'Personal',
    });
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar Note List */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 flex flex-col space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
              Notes & Knowledge
            </h2>
          </div>

          <button
            onClick={handleCreateNote}
            className="btn-primary p-2 rounded-xl transition-all shadow-xs"
            title="Create New Note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Folders</option>
            <option value="Career">Career</option>
            <option value="Research">Research</option>
            <option value="Client">Client</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredNotes.map((n) => {
            const isActive = n.id === activeNote?.id;
            return (
              <div
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60 shadow-2xs'
                    : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {n.title || 'Untitled'}
                  </span>
                  {n.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                </div>

                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                  {n.content.replace(/[#*`]/g, '')}
                </p>

                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                  <Badge variant="outline" size="sm">
                    {n.category}
                  </Badge>
                  <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Pane */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col space-y-4 shadow-xs">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Note Title..."
                className="text-xl font-black bg-transparent text-gray-900 dark:text-white focus:outline-hidden flex-1"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(activeNote.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    activeNote.pinned
                      ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700'
                  }`}
                  title="Pin Note"
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <textarea
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                placeholder="Type your notes in Markdown..."
                className="w-full flex-1 bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm text-gray-800 dark:text-gray-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 resize-none leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
            <Brain className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm">Select a note or create a new one to begin editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
