import { create } from 'zustand';
import { Project, ProjectFeature, ProjectBug } from '../types';
import { isUserAuthenticated } from '../lib/authCheck';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;

  loadFromDB: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProjectId: (id: string) => void;

  toggleFeature: (projectId: string, featureId: string) => Promise<void>;
  addFeature: (projectId: string, title: string) => Promise<void>;
  
  addBug: (projectId: string, bug: Omit<ProjectBug, 'id'>) => Promise<void>;
  updateBugStatus: (projectId: string, bugId: string, status: ProjectBug['status']) => Promise<void>;
  
  resetProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => {
  // Sync with MongoDB API on store load (if authenticated)
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return;
      fetch('/api/projects')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.projects) {
            set({ projects: data.projects });
          }
        })
        .catch((err) => console.warn('[MongoDB ProjectSync] Offline or API unreachable', err));
    });
  }

  return {
    projects: [],
    activeProjectId: '',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const data = await res.json();
        if (data.projects) {
          set({ projects: data.projects });
        }
      } catch (err) {
        console.warn('Failed to load projects from MongoDB API', err);
      }
    },

    addProject: async (data) => {
      const newId = `proj-${Date.now()}`;
      const newProj: Project = {
        ...data,
        id: newId,
      };

      set((state) => ({
        projects: [...state.projects, newProj],
        activeProjectId: state.activeProjectId || newId,
      }));

      // Persist to MongoDB API
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj),
      }).catch((err) => console.warn('Failed to save project to MongoDB API', err));

      return newId;
    },

    updateProject: async (id, updates) => {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      }).catch((err) => console.warn('Failed to update project in MongoDB API', err));
    },

    deleteProject: async (id) => {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? '' : state.activeProjectId,
      }));

      fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Failed to delete project from MongoDB API', err));
    },

    setActiveProjectId: (id) => set({ activeProjectId: id }),

    toggleFeature: async (projectId, featureId) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedFeatures = currentProj.features.map((f) =>
        f.id === featureId ? { ...f, completed: !f.completed } : f
      );
      const completedCount = updatedFeatures.filter((f) => f.completed).length;
      const newProgress = updatedFeatures.length > 0
        ? Math.round((completedCount / updatedFeatures.length) * 100)
        : currentProj.progress;

      const updatedProj = { ...currentProj, features: updatedFeatures, progress: newProgress };

      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updatedProj : p)),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, features: updatedFeatures, progress: newProgress }),
      }).catch((err) => console.warn('Failed to update feature in MongoDB API', err));
    },

    addFeature: async (projectId, title) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const newFeature: ProjectFeature = {
        id: `f-${Date.now()}`,
        title,
        completed: false,
      };

      const updatedFeatures = [...currentProj.features, newFeature];
      const completedCount = updatedFeatures.filter((f) => f.completed).length;
      const newProgress = Math.round((completedCount / updatedFeatures.length) * 100);

      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            return { ...p, features: updatedFeatures, progress: newProgress };
          }
          return p;
        }),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, features: updatedFeatures, progress: newProgress }),
      }).catch((err) => console.warn('Failed to add feature to MongoDB API', err));
    },

    addBug: async (projectId, bugData) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const newBug: ProjectBug = {
        ...bugData,
        id: `b-${Date.now()}`,
      };

      const updatedBugs = [...currentProj.bugs, newBug];

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, bugs: updatedBugs } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, bugs: updatedBugs }),
      }).catch((err) => console.warn('Failed to add bug to MongoDB API', err));
    },

    updateBugStatus: async (projectId, bugId, status) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedBugs = currentProj.bugs.map((b) => (b.id === bugId ? { ...b, status } : b));

      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            return { ...p, bugs: updatedBugs };
          }
          return p;
        }),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, bugs: updatedBugs }),
      }).catch((err) => console.warn('Failed to update bug status in MongoDB API', err));
    },

    resetProjects: () => set({ projects: [], activeProjectId: '' }),
  };
});
