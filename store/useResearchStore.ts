import { create } from 'zustand';
import {
  ResearchProject,
  ResearchSection,
  ResearchPaper,
  ResearchStatus,
  PaperStatus,
} from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';

const ACTIVE_PROJECT_KEY = 'meraj_os_active_research_project_id';

interface ResearchState {
  projects: ResearchProject[];
  activeProjectId: string | null;
  isLoading: boolean;

  // Sync
  fetchProjects: () => Promise<void>;
  saveProjects: (projects: ResearchProject[]) => Promise<void>;

  // Project Actions
  addProject: (data: Omit<ResearchProject, 'id' | 'sections' | 'progress' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ResearchProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;

  // Section Actions
  addSection: (projectId: string, data: Omit<ResearchSection, 'id' | 'createdAt' | 'order'>) => Promise<void>;
  updateSection: (projectId: string, sectionId: string, updates: Partial<ResearchSection>) => Promise<void>;
  deleteSection: (projectId: string, sectionId: string) => Promise<void>;

  // Paper Actions
  addPaper: (projectId: string, sectionId: string, paper: Omit<ResearchPaper, 'id' | 'addedAt'>) => Promise<void>;
  updatePaper: (projectId: string, sectionId: string, paperId: string, updates: Partial<ResearchPaper>) => Promise<void>;
  deletePaper: (projectId: string, sectionId: string, paperId: string) => Promise<void>;
  togglePaperImportant: (projectId: string, sectionId: string, paperId: string) => Promise<void>;
}

export const useResearchStore = create<ResearchState>((set, get) => {
  // Load initial activeProjectId from localStorage if available
  const initialActiveId =
    typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_PROJECT_KEY) : null;

  // Trigger initial fetch
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (authenticated) {
        get().fetchProjects();
      }
    });
  }

  return {
    projects: [],
    activeProjectId: initialActiveId,
    isLoading: false,

    fetchProjects: async () => {
      set({ isLoading: true });
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/research', { headers });
        if (res.ok) {
          const data = await res.json();
          set({ projects: data.projects ?? [], isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.warn('Failed to fetch research projects:', err);
        set({ isLoading: false });
      }
    },

    saveProjects: async (projects: ResearchProject[]) => {
      set({ projects });
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        await fetch('/api/research', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects }),
        });
      } catch (err) {
        console.warn('Failed to save research projects:', err);
      }
    },


    // ─── Project Actions ───────────────────────────────────────────────────────

    addProject: async (data) => {
      const now = new Date().toISOString();
      const newProject: ResearchProject = {
        ...data,
        id: `proj_${Date.now()}`,
        progress: 0,
        sections: [
          {
            id: `sec_${Date.now()}_1`,
            type: 'literature_review',
            title: 'Literature Review',
            papers: [],
            createdAt: now,
            order: 0,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newProject, ...get().projects];
      get().setActiveProject(newProject.id);
      await get().saveProjects(updated);
    },

    updateProject: async (id, updates) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: now } : p
      );
      await get().saveProjects(updated);
    },

    deleteProject: async (id) => {
      const updated = get().projects.filter((p) => p.id !== id);
      if (get().activeProjectId === id) {
        get().setActiveProject(null);
      }
      await get().saveProjects(updated);
    },

    setActiveProject: (id) => {
      set({ activeProjectId: id });
      if (typeof window !== 'undefined') {
        if (id) localStorage.setItem(ACTIVE_PROJECT_KEY, id);
        else localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    },

    // ─── Section Actions ───────────────────────────────────────────────────────

    addSection: async (projectId, data) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newSection: ResearchSection = {
          ...data,
          id: `sec_${Date.now()}`,
          createdAt: now,
          order: proj.sections.length,
          ...(data.type === 'literature_review' ? { papers: [] } : {}),
        };
        return {
          ...proj,
          sections: [...proj.sections, newSection],
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    updateSection: async (projectId, sectionId, updates) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map((s) =>
            s.id === sectionId ? { ...s, ...updates } : s
          ),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    deleteSection: async (projectId, sectionId) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.filter((s) => s.id !== sectionId),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    // ─── Paper Actions ─────────────────────────────────────────────────────────

    addPaper: async (projectId, sectionId, paperData) => {
      const now = new Date().toISOString();
      const newPaper: ResearchPaper = {
        ...paperData,
        id: `paper_${Date.now()}`,
        addedAt: now,
      };
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              papers: [...(sec.papers ?? []), newPaper],
            };
          }),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    updatePaper: async (projectId, sectionId, paperId, updates) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              papers: (sec.papers ?? []).map((p) =>
                p.id === paperId ? { ...p, ...updates } : p
              ),
            };
          }),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    deletePaper: async (projectId, sectionId, paperId) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              papers: (sec.papers ?? []).filter((p) => p.id !== paperId),
            };
          }),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },

    togglePaperImportant: async (projectId, sectionId, paperId) => {
      const now = new Date().toISOString();
      const updated = get().projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          sections: proj.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              papers: (sec.papers ?? []).map((p) =>
                p.id === paperId ? { ...p, isImportant: !p.isImportant } : p
              ),
            };
          }),
          updatedAt: now,
        };
      });
      await get().saveProjects(updated);
    },
  };
});
