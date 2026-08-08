import { create } from 'zustand';
import { Paper, WritingSection, ResearchOverview } from '../types';
import { isUserAuthenticated } from '../lib/authCheck';

interface ResearchState {
  overview: ResearchOverview;
  papers: Paper[];
  writingSections: WritingSection[];
  searchQuery: string;
  selectedStatusFilter: string;

  loadFromDB: () => Promise<void>;
  updateOverview: (updates: Partial<ResearchOverview>) => Promise<void>;
  addPaper: (paper: Omit<Paper, 'id'>) => Promise<void>;
  updatePaper: (id: string, updates: Partial<Paper>) => Promise<void>;
  deletePaper: (id: string) => Promise<void>;

  updateWritingSection: (id: string, updates: Partial<WritingSection>) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedStatusFilter: (status: string) => void;
  resetResearch: () => void;
}

const DEFAULT_OVERVIEW: ResearchOverview = {
  topic: '',
  thesisTitle: '',
  paperTitle: '',
  progress: 0,
  hoursSpent: 0,
  papersRead: 0,
  writingProgress: 0,
};

export const useResearchStore = create<ResearchState>((set, get) => {
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return;
      fetch('/api/research')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.research) {
            set({
              overview: data.research.overview || DEFAULT_OVERVIEW,
              papers: data.research.papers || [],
              writingSections: data.research.writingSections || [],
            });
          }
        })
        .catch((err) => console.warn('[MongoDB ResearchSync] Offline or API unreachable', err));
    });
  }

  const syncToDB = async (state: Partial<ResearchState>) => {
    const authenticated = await isUserAuthenticated();
    if (!authenticated) return;
    const currentState = get();
    const payload = {
      overview: state.overview || currentState.overview,
      papers: state.papers || currentState.papers,
      writingSections: state.writingSections || currentState.writingSections,
    };

    fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Failed to sync research to MongoDB API', err));
  };

  return {
    overview: DEFAULT_OVERVIEW,
    papers: [],
    writingSections: [],
    searchQuery: '',
    selectedStatusFilter: 'all',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/research');
        if (!res.ok) return;
        const data = await res.json();
        if (data.research) {
          set({
            overview: data.research.overview || DEFAULT_OVERVIEW,
            papers: data.research.papers || [],
            writingSections: data.research.writingSections || [],
          });
        }
      } catch (err) {
        console.warn('Failed to load research from MongoDB API', err);
      }
    },

    updateOverview: async (updates) => {
      const newOverview = { ...get().overview, ...updates };
      set({ overview: newOverview });
      syncToDB({ overview: newOverview });
    },

    addPaper: async (paperData) => {
      const newPaper: Paper = {
        ...paperData,
        id: `paper-${Date.now()}`,
      };

      const updatedPapers = [newPaper, ...get().papers];
      const papersRead = updatedPapers.filter((p) => p.status === 'cited' || p.status === 'reading').length;
      const newOverview = { ...get().overview, papersRead };

      set({ papers: updatedPapers, overview: newOverview });
      syncToDB({ papers: updatedPapers, overview: newOverview });
    },

    updatePaper: async (id, updates) => {
      const updatedPapers = get().papers.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const papersRead = updatedPapers.filter((p) => p.status === 'cited' || p.status === 'reading').length;
      const newOverview = { ...get().overview, papersRead };

      set({ papers: updatedPapers, overview: newOverview });
      syncToDB({ papers: updatedPapers, overview: newOverview });
    },

    deletePaper: async (id) => {
      const updatedPapers = get().papers.filter((p) => p.id !== id);
      const papersRead = updatedPapers.filter((p) => p.status === 'cited' || p.status === 'reading').length;
      const newOverview = { ...get().overview, papersRead };

      set({ papers: updatedPapers, overview: newOverview });
      syncToDB({ papers: updatedPapers, overview: newOverview });
    },

    updateWritingSection: async (id, updates) => {
      const updatedSections = get().writingSections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );

      const totalTarget = updatedSections.reduce((acc, s) => acc + s.targetWords, 0);
      const totalCurrent = updatedSections.reduce((acc, s) => acc + s.currentWords, 0);
      const writingProgress = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
      const newOverview = { ...get().overview, writingProgress };

      set({ writingSections: updatedSections, overview: newOverview });
      syncToDB({ writingSections: updatedSections, overview: newOverview });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedStatusFilter: (status) => set({ selectedStatusFilter: status }),
    resetResearch: () => set({ overview: DEFAULT_OVERVIEW, papers: [], writingSections: [] }),
  };
});
