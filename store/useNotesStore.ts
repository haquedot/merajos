import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note } from '../types';

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  selectedCategory: string;

  addNote: (note?: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  resetNotes: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      activeNoteId: null,
      searchQuery: '',
      selectedCategory: 'all',

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
        return newId;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          return {
            notes: filtered,
            activeNoteId: state.activeNoteId === id ? (filtered[0]?.id || null) : state.activeNoteId,
          };
        });
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }));
      },

      setActiveNoteId: (id) => set({ activeNoteId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      resetNotes: () => set({ notes: [], activeNoteId: null }),
    }),
    {
      name: 'meraj_os_notes',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
