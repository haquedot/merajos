'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Folder,
  FolderPlus,
  Sparkles,
  Brain,
  ChevronLeft,
  Share2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { Note } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { ShareNoteModal } from '../../components/notes/ShareNoteModal';
import { ManageFoldersModal } from '../../components/notes/ManageFoldersModal';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { NotesSkeleton } from '../../components/ui/Skeleton';

export default function NotesPage() {
  const {
    notes,
    folders,
    isLoading: isLoadingNotes,
    activeNoteId,
    searchQuery,
    selectedFolder,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    setActiveNoteId,
    setSearchQuery,
    setSelectedFolder,
  } = useNotesStore();

  const [mobileTab, setMobileTab] = useState<'list' | 'editor'>('list');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  if (isLoadingNotes) {
    return <NotesSkeleton />;
  }

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || (n.folder || 'General') === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const defaultFolder = selectedFolder !== 'all' ? selectedFolder : 'General';
    const newId = addNote({
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing your Markdown content here...',
      folder: defaultFolder,
    });
    setMobileTab('editor');
  };

  const handleUpdateShareSettings = async (isPublic: boolean, sharedWithEmails: string[]) => {
    if (noteToShare) {
      await updateNote(noteToShare.id, { isPublic, sharedWithEmails });
      setToastNotice(isPublic ? '✓ Public share link active!' : '✓ Share settings saved.');
      setTimeout(() => setToastNotice(null), 2500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        icon={FileText}
        iconBgColor="bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400"
        title="Notes & Second Brain"
        badgeText={`${notes.length} Notes`}
        badgeVariant="amber"
        subtitle="Capture thoughts, organize knowledge, manage folders, and share notes"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManageFoldersOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-amber-500" />
              <span>Folders ({folders.length})</span>
            </button>
            <button
              onClick={handleCreateNote}
              className="btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        }
      />

      {toastNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-between animate-fade-in">
          <span>{toastNotice}</span>
          <button onClick={() => setToastNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            ✕
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'list'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Notes List ({filteredNotes.length})
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'editor'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Note Editor
        </button>
      </div>

      <div className="min-h-[calc(100vh-14rem)] flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Sidebar Note List */}
        <div
          className={`w-full md:w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 flex-col space-y-4 shadow-xs shrink-0 ${
            mobileTab === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                Notes
              </h2>
            </div>

            <button
              onClick={handleCreateNote}
              className="btn-primary p-2 rounded-xl transition-all shadow-xs shrink-0"
              title="Create New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Folder Filter */}
          <div className="space-y-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
            />

            {/* Folder Tabs / Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Folders
                </span>
                <button
                  onClick={() => setIsManageFoldersOpen(true)}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedFolder('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                    selectedFolder === 'all'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  All ({notes.length})
                </button>
                {folders.map((f) => {
                  const count = notes.filter((n) => (n.folder || 'General') === f).length;
                  return (
                    <button
                      key={f}
                      onClick={() => setSelectedFolder(f)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                        selectedFolder === f
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <span>{f}</span>
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Note Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px] md:max-h-none">
            {filteredNotes.map((n) => {
              const isActive = n.id === activeNote?.id;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setActiveNoteId(n.id);
                    setMobileTab('editor');
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border group ${
                    isActive
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60 shadow-2xs'
                      : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {n.title || 'Untitled'}
                      </span>
                      {n.isPublic && <Globe className="w-3 h-3 text-emerald-500 shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {n.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      <Link
                        href={`/notes/${n.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors opacity-0 group-hover:opacity-100"
                        title="Open Full Page View"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                    {n.content.replace(/[#*`]/g, '')}
                  </p>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                      📁 {n.folder || 'General'}
                    </span>
                    <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Pane */}
        <div
          className={`flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-col space-y-4 shadow-xs ${
            mobileTab === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeNote ? (
            <>
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => setMobileTab('list')}
                    className="md:hidden p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 shrink-0"
                    title="Back to Notes List"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    placeholder="Note Title..."
                    className="text-base sm:text-xl font-black bg-transparent text-gray-900 dark:text-white focus:outline-hidden min-w-0 flex-1 truncate"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Folder Dropdown in Editor */}
                  <select
                    value={activeNote.folder || 'General'}
                    onChange={(e) => updateNote(activeNote.id, { folder: e.target.value })}
                    className="hidden sm:block text-xs font-bold px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-hidden cursor-pointer"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f} className="dark:bg-gray-900">
                        📁 {f}
                      </option>
                    ))}
                  </select>

                  {/* Open Full Page Button */}
                  <Link
                    href={`/notes/${activeNote.id}`}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Open Full Page View"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Full Page</span>
                  </Link>

                  {/* Share Note Button */}
                  <button
                    onClick={() => setNoteToShare(activeNote)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Share Note"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    onClick={() => togglePin(activeNote.id)}
                    className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                      activeNote.pinned
                        ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700'
                    }`}
                    title="Pin Note"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setNoteToDelete(activeNote.id)}
                    className="p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
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
                  className="w-full flex-1 min-h-[300px] sm:min-h-[400px] bg-gray-50/50 dark:bg-gray-800/40 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 resize-none leading-relaxed"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 min-h-[300px]">
              <Brain className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm">Select a note or create a new one to begin editing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {noteToShare && (
        <ShareNoteModal
          isOpen={!!noteToShare}
          onClose={() => setNoteToShare(null)}
          note={noteToShare}
          onUpdateShareSettings={handleUpdateShareSettings}
        />
      )}

      {/* Manage Folders Modal */}
      <ManageFoldersModal
        isOpen={isManageFoldersOpen}
        onClose={() => setIsManageFoldersOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete);
            setNoteToDelete(null);
          }
        }}
        title="Delete Note"
        itemName={notes.find((n) => n.id === noteToDelete)?.title}
        message="Are you sure you want to delete this note? It will be removed permanently."
      />
    </div>
  );
}
