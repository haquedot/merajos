import { create } from 'zustand';
import { Note } from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';

const DEFAULT_FOLDERS = ['General', 'Work', 'Personal', 'Research', 'Archive'];

interface NotesState {
  notes: Note[];
  folders: string[];
  isLoading: boolean;
  activeNoteId: string | null;
  searchQuery: string;
  selectedFolder: string;

  loadFromDB: () => Promise<void>;
  addNote: (note?: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folder: string) => void;
  createFolder: (folderName: string) => void;
  renameFolder: (oldName: string, newName: string) => Promise<void>;
  deleteFolder: (folderName: string, moveTargetFolder?: string) => Promise<void>;
  resetNotes: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => {
  // Load initial folders from localStorage if available
  let initialFolders = DEFAULT_FOLDERS;
  if (typeof window !== 'undefined') {
    try {
      const savedFolders = localStorage.getItem('orbit_note_folders');
      if (savedFolders) {
        initialFolders = JSON.parse(savedFolders);
      }
    } catch (e) {
      console.warn('Could not read saved folders', e);
    }

    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/notes', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.notes) {
            // Extract any folders present in notes that aren't in folder list
            const noteFolders = data.notes.map((n: Note) => n.folder).filter(Boolean);
            const combinedFolders = Array.from(new Set([...initialFolders, ...noteFolders]));

            set({ notes: data.notes, folders: combinedFolders, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.warn('[MongoDB NoteSync] Offline or API unreachable', err);
        set({ isLoading: false });
      }
    });
  }

  const persistFolders = (folders: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orbit_note_folders', JSON.stringify(folders));
      } catch (e) {
        console.warn('Could not save folders', e);
      }
    }
  };

  return {
    notes: [],
    folders: initialFolders,
    isLoading: true,
    activeNoteId: null,
    searchQuery: '',
    selectedFolder: 'all',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/notes', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (data.notes) {
          const noteFolders = data.notes.map((n: Note) => n.folder).filter(Boolean);
          const combinedFolders = Array.from(new Set([...get().folders, ...noteFolders]));
          set({ notes: data.notes, folders: combinedFolders });
          persistFolders(combinedFolders);
        }
      } catch (err) {
        console.warn('Failed to load notes from MongoDB API', err);
      }
    },

    addNote: (customData) => {
      const newId = `note-${Date.now()}`;
      const newNote: Note = {
        id: newId,
        title: customData?.title || 'Untitled Note',
        content: customData?.content || '',
        pinned: customData?.pinned || false,
        folder: customData?.folder || (get().selectedFolder !== 'all' ? get().selectedFolder : 'General'),
        isPublic: customData?.isPublic || false,
        sharedWithEmails: customData?.sharedWithEmails || [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        notes: [newNote, ...state.notes],
        activeNoteId: newId,
      }));

      getAuthHeaders().then((headers) => {
        fetch('/api/notes', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newNote),
        }).catch((err) => console.warn('Failed to save note to MongoDB API', err));
      });

      return newId;
    },

    updateNote: async (id, updates) => {
      const updatedAt = new Date().toISOString();
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt } : n
        ),
      }));

      const authenticated = await isUserAuthenticated();
      if (!authenticated) {
        throw new Error('You must be authenticated with Google to sync & share notes in MongoDB.');
      }

      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates, updatedAt }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update note in MongoDB');
        }
      } catch (err: any) {
        console.warn('Failed to update note in MongoDB API', err);
        throw err;
      }
    },

    deleteNote: async (id) => {
      set((state) => {
        const filtered = state.notes.filter((n) => n.id !== id);
        return {
          notes: filtered,
          activeNoteId: state.activeNoteId === id ? filtered[0]?.id || null : state.activeNoteId,
        };
      });

      try {
        const headers = await getAuthHeaders();
        await fetch(`/api/notes?id=${id}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.warn('Failed to delete note from MongoDB API', err);
      }
    },

    togglePin: async (id) => {
      let isPinned = false;
      set((state) => ({
        notes: state.notes.map((n) => {
          if (n.id === id) {
            isPinned = !n.pinned;
            return { ...n, pinned: isPinned };
          }
          return n;
        }),
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, pinned: isPinned }),
        });
      } catch (err) {
        console.warn('Failed to toggle pin in MongoDB API', err);
      }
    },

    createFolder: (folderName) => {
      const trimmed = folderName.trim();
      if (!trimmed) return;
      const current = get().folders;
      if (current.includes(trimmed)) return;

      const updated = [...current, trimmed];
      set({ folders: updated, selectedFolder: trimmed });
      persistFolders(updated);
    },

    renameFolder: async (oldName, newName) => {
      const trimmed = newName.trim();
      if (!trimmed || oldName === trimmed) return;

      const currentFolders = get().folders;
      const updatedFolders = currentFolders.map((f) => (f === oldName ? trimmed : f));
      persistFolders(updatedFolders);

      // Update notes with this folder
      const affectedNotes = get().notes.filter((n) => n.folder === oldName);
      set((state) => ({
        folders: updatedFolders,
        selectedFolder: state.selectedFolder === oldName ? trimmed : state.selectedFolder,
        notes: state.notes.map((n) => (n.folder === oldName ? { ...n, folder: trimmed } : n)),
      }));

      // Update affected notes in DB
      try {
        const headers = await getAuthHeaders();
        for (const n of affectedNotes) {
          await fetch('/api/notes', {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: n.id, folder: trimmed }),
          });
        }
      } catch (err) {
        console.warn('Failed to rename folder notes in DB', err);
      }
    },

    deleteFolder: async (folderName, moveTargetFolder = 'General') => {
      if (folderName === 'General') return; // Protect default folder

      const currentFolders = get().folders;
      const updatedFolders = currentFolders.filter((f) => f !== folderName);
      persistFolders(updatedFolders);

      const affectedNotes = get().notes.filter((n) => n.folder === folderName);
      set((state) => ({
        folders: updatedFolders,
        selectedFolder: state.selectedFolder === folderName ? 'all' : state.selectedFolder,
        notes: state.notes.map((n) => (n.folder === folderName ? { ...n, folder: moveTargetFolder } : n)),
      }));

      try {
        const headers = await getAuthHeaders();
        for (const n of affectedNotes) {
          await fetch('/api/notes', {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: n.id, folder: moveTargetFolder }),
          });
        }
      } catch (err) {
        console.warn('Failed to move notes on folder deletion', err);
      }
    },

    setActiveNoteId: (id) => set({ activeNoteId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedFolder: (folder) => set({ selectedFolder: folder }),
    resetNotes: () => set({ notes: [], activeNoteId: null }),
  };
});
