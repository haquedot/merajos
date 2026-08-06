import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Paper, WritingSection, ResearchOverview } from '../types';

interface ResearchState {
  overview: ResearchOverview;
  papers: Paper[];
  writingSections: WritingSection[];
  searchQuery: string;
  selectedStatusFilter: string;

  updateOverview: (updates: Partial<ResearchOverview>) => void;
  addPaper: (paper: Omit<Paper, 'id'>) => void;
  updatePaper: (id: string, updates: Partial<Paper>) => void;
  deletePaper: (id: string) => void;

  updateWritingSection: (id: string, updates: Partial<WritingSection>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedStatusFilter: (status: string) => void;
  resetResearch: () => void;
}

const DEFAULT_OVERVIEW: ResearchOverview = {
  topic: 'Research & Thesis Dashboard',
  thesisTitle: 'My Thesis Title',
  paperTitle: 'Research Topic',
  progress: 0,
  hoursSpent: 0,
  papersRead: 0,
  writingProgress: 0,
};

export const useResearchStore = create<ResearchState>()(
  persist(
    (set) => ({
      overview: DEFAULT_OVERVIEW,
      papers: [],
      writingSections: [],
      searchQuery: '',
      selectedStatusFilter: 'all',

      updateOverview: (updates) => {
        set((state) => ({ overview: { ...state.overview, ...updates } }));
      },

      addPaper: (paperData) => {
        const newPaper: Paper = {
          ...paperData,
          id: `paper-${Date.now()}`,
        };
        set((state) => {
          const papers = [newPaper, ...state.papers];
          const papersRead = papers.filter((p) => p.status === 'cited' || p.status === 'reading').length;
          return {
            papers,
            overview: { ...state.overview, papersRead },
          };
        });
      },

      updatePaper: (id, updates) => {
        set((state) => {
          const papers = state.papers.map((p) => (p.id === id ? { ...p, ...updates } : p));
          const papersRead = papers.filter((p) => p.status === 'cited' || p.status === 'reading').length;
          return {
            papers,
            overview: { ...state.overview, papersRead },
          };
        });
      },

      deletePaper: (id) => {
        set((state) => ({
          papers: state.papers.filter((p) => p.id !== id),
        }));
      },

      updateWritingSection: (id, updates) => {
        set((state) => {
          const writingSections = state.writingSections.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          );
          const totalTarget = writingSections.reduce((acc, curr) => acc + curr.targetWords, 0);
          const totalCurrent = writingSections.reduce((acc, curr) => acc + curr.currentWords, 0);
          const writingProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

          return {
            writingSections,
            overview: { ...state.overview, writingProgress },
          };
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedStatusFilter: (status) => set({ selectedStatusFilter: status }),
      resetResearch: () =>
        set({
          overview: DEFAULT_OVERVIEW,
          papers: [],
          writingSections: [],
        }),
    }),
    {
      name: 'meraj_os_research',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
