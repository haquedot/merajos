import { create } from 'zustand';
import { Note } from '../types';
import { isUserAuthenticated } from '../lib/authCheck';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  activeNoteId: string | null;
  searchQuery: string;
  selectedCategory: string;

  loadFromDB: () => Promise<void>;
  addNote: (note?: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  resetNotes: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => {
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      fetch('/api/notes')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.notes) {
            set({ notes: data.notes, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        })
        .catch((err) => {
          console.warn('[MongoDB NoteSync] Offline or API unreachable', err);
          set({ isLoading: false });
        });
    });
  }

  return {
    notes: [],
    isLoading: true,
    activeNoteId: null,
    searchQuery: '',
    selectedCategory: 'all',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/notes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.notes) {
          set({ notes: data.notes });
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
        category: customData?.category || 'Personal',
        pinned: customData?.pinned || false,
        folder: customData?.folder || 'General',
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        notes: [newNote, ...state.notes],
        activeNoteId: newId,
      }));

      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      }).catch((err) => console.warn('Failed to save note to MongoDB API', err));

      return newId;
    },

    updateNote: async (id, updates) => {
      const updatedAt = new Date().toISOString();
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt }
            : n
        ),
      }));

      fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, updatedAt }),
      }).catch((err) => console.warn('Failed to update note in MongoDB API', err));
    },

    deleteNote: async (id) => {
      set((state) => {
        const filtered = state.notes.filter((n) => n.id !== id);
        return {
          notes: filtered,
          activeNoteId: state.activeNoteId === id ? (filtered[0]?.id || null) : state.activeNoteId,
        };
      });

      fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete note from MongoDB API', err));
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

      fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned: isPinned }),
      }).catch((err) => console.warn('Failed to toggle pin in MongoDB API', err));
    },

    setActiveNoteId: (id) => set({ activeNoteId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    resetNotes: () => set({ notes: [], activeNoteId: null }),
  };
});
