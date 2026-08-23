'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  FileText,
  Pin,
  Share2,
  Trash2,
  Edit3,
  Eye,
  Folder,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNotesStore } from '../../../store/useNotesStore';
import { Note } from '../../../types';
import { MarkdownViewer } from '../../../components/notes/MarkdownViewer';
import { ShareNoteModal } from '../../../components/notes/ShareNoteModal';
import { ConfirmDeleteModal } from '../../../components/modals/ConfirmDeleteModal';
import { DashboardSkeleton } from '../../../components/ui/Skeleton';

export default function DedicatedNotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const resolvedParams = use(params);
  const noteId = resolvedParams.noteId;
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    notes,
    folders,
    isLoading: isStoreLoading,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotesStore();

  const [fetchedNote, setFetchedNote] = useState<Note | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPublicAccess, setIsPublicAccess] = useState(false);

  // Default mode is 'edit' for full-page editing
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find in store first
  const storeNote = notes.find((n) => n.id === noteId);
  const note = storeNote || fetchedNote;

  // Determine if this is a read-only share view (guest/public link viewer)
  const isReadOnlyShareView = !storeNote && (isPublicAccess || note?.isPublic);

  useEffect(() => {
    if (!storeNote && noteId) {
      setIsLoadingApi(true);
      fetch(`/api/notes/${noteId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to load note');
          }
          return res.json();
        })
        .then((data) => {
          if (data.note) {
            setFetchedNote(data.note);
            setIsPublicAccess(!!data.isPublicAccess);
            if (data.isPublicAccess) {
              setMode('view'); // Sharable link viewers get view mode only
            }
          }
        })
        .catch((err) => {
          setApiError(err.message);
        })
        .finally(() => {
          setIsLoadingApi(false);
        });
    }
  }, [storeNote, noteId]);

  // Focus cursor on note content when in edit mode
  useEffect(() => {
    if (mode === 'edit' && !isReadOnlyShareView) {
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode, isReadOnlyShareView, note?.id]);

  if (isStoreLoading || isLoadingApi) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (apiError || !note) {
    return (
      <div className="max-w-xl mx-auto my-12 sm:my-16 p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Note Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {apiError || "The requested note could not be found or you don't have permission to view it."}
        </p>
        <div className="pt-2">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orbit-blue hover:bg-orbit-blue-hover text-white text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Notes</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleTitleChange = (newTitle: string) => {
    if (storeNote) {
      updateNote(note.id, { title: newTitle });
    } else {
      setFetchedNote({ ...note, title: newTitle });
    }
  };

  const handleContentChange = (newContent: string) => {
    if (storeNote) {
      updateNote(note.id, { content: newContent });
    } else {
      setFetchedNote({ ...note, content: newContent });
    }
  };

  const handleFolderChange = (newFolder: string) => {
    if (storeNote) {
      updateNote(note.id, { folder: newFolder });
    } else {
      setFetchedNote({ ...note, folder: newFolder });
    }
  };

  const handleUpdateShareSettings = async (isPublic: boolean, sharedWithEmails: string[]) => {
    if (storeNote) {
      await updateNote(note.id, { isPublic, sharedWithEmails });
    } else {
      setFetchedNote({ ...note, isPublic, sharedWithEmails });
    }
    setToastMessage(isPublic ? '✓ Public share link is active!' : '✓ Share settings updated.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    await deleteNote(note.id);
    router.push('/notes');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 pb-8 sm:pb-12 px-2 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-xl border border-gray-800 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile-Responsive Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-1 sm:py-2">
        {/* Left: Back Link & Folder Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
          <Link
            href="/notes"
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Notes</span>
          </Link>

          <span className="text-gray-300 dark:text-gray-700 hidden xs:inline">/</span>

          {/* Read-Only Badge OR Editable Folder Select */}
          {isReadOnlyShareView ? (
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
              <Folder className="w-3.5 h-3.5" />
              <span>{note.folder || 'General'}</span>
            </span>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs shrink-0">
              <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <select
                value={note.folder || 'General'}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="bg-transparent font-extrabold text-gray-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {(folders.length > 0 ? folders : ['General', 'Work', 'Personal', 'Research']).map((f) => (
                  <option key={f} value={f} className="dark:bg-gray-900">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isReadOnlyShareView ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
              <Globe className="w-3 h-3" /> Shared View
            </span>
          ) : note.isPublic ? (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shrink-0">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : null}
        </div>

        {/* Right: Actions */}
        {!isReadOnlyShareView && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Mode Switcher */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setMode('edit')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  mode === 'edit'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Edit</span>
              </button>
              <button
                onClick={() => setMode('view')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  mode === 'view'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Preview</span>
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Share Note"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </button>

            {storeNote && (
              <>
                <button
                  onClick={() => togglePin(note.id)}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    note.pinned
                      ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700'
                  }`}
                  title="Pin Note"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Responsive Note Canvas */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 shadow-xs min-h-[calc(100vh-10rem)] flex flex-col">
        {/* Title */}
        <div className="space-y-1.5 sm:space-y-2 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
          {isReadOnlyShareView ? (
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {note.title || 'Untitled Note'}
            </h1>
          ) : (
            <input
              type="text"
              value={note.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note Title..."
              className="w-full text-xl sm:text-3xl md:text-4xl font-black bg-transparent text-gray-900 dark:text-white focus:outline-hidden tracking-tight"
            />
          )}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 pt-0.5">
            <Clock className="w-3 h-3" />
            <span>Updated {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Note Body */}
        <div className="flex-1 flex flex-col">
          {isReadOnlyShareView || mode === 'view' ? (
            <MarkdownViewer content={note.content} />
          ) : (
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Type your markdown content here..."
              className="w-full flex-1 min-h-[350px] sm:min-h-[500px] bg-transparent text-sm sm:text-base text-gray-800 dark:text-gray-200 font-mono focus:outline-hidden resize-none leading-relaxed"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {!isReadOnlyShareView && (
        <ShareNoteModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          note={note}
          onUpdateShareSettings={handleUpdateShareSettings}
        />
      )}

      {/* Delete Confirmation Modal */}
      {!isReadOnlyShareView && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Note"
          itemName={note.title}
          message="Are you sure you want to delete this note? It will be permanently removed."
        />
      )}
    </div>
  );
}
