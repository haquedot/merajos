import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, ProjectFeature, ProjectBug } from '../types';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;

  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string) => void;

  toggleFeature: (projectId: string, featureId: string) => void;
  addFeature: (projectId: string, title: string) => void;
  
  addBug: (projectId: string, bug: Omit<ProjectBug, 'id'>) => void;
  updateBugStatus: (projectId: string, bugId: string, status: ProjectBug['status']) => void;
  
  resetProjects: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: '',

      addProject: (data) => {
        const newId = `proj-${Date.now()}`;
        const newProj: Project = {
          ...data,
          id: newId,
        };
        set((state) => ({
          projects: [...state.projects, newProj],
          activeProjectId: state.activeProjectId || newId,
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? '' : state.activeProjectId,
        }));
      },

      setActiveProjectId: (id) => set({ activeProjectId: id }),

      toggleFeature: (projectId, featureId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId) {
              const updatedFeatures = p.features.map((f) =>
                f.id === featureId ? { ...f, completed: !f.completed } : f
              );
              const completedCount = updatedFeatures.filter((f) => f.completed).length;
              const newProgress = updatedFeatures.length > 0
                ? Math.round((completedCount / updatedFeatures.length) * 100)
                : p.progress;

              return {
                ...p,
                features: updatedFeatures,
                progress: newProgress,
              };
            }
            return p;
          }),
        }));
      },

      addFeature: (projectId, title) => {
        const newFeature: ProjectFeature = {
          id: `f-${Date.now()}`,
          title,
          completed: false,
        };
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId) {
              const updatedFeatures = [...p.features, newFeature];
              const completedCount = updatedFeatures.filter((f) => f.completed).length;
              const newProgress = Math.round((completedCount / updatedFeatures.length) * 100);
              return { ...p, features: updatedFeatures, progress: newProgress };
            }
            return p;
          }),
        }));
      },

      addBug: (projectId, bugData) => {
        const newBug: ProjectBug = {
          ...bugData,
          id: `b-${Date.now()}`,
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, bugs: [...p.bugs, newBug] } : p
          ),
        }));
      },

      updateBugStatus: (projectId, bugId, status) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                bugs: p.bugs.map((b) => (b.id === bugId ? { ...b, status } : b)),
              };
            }
            return p;
          }),
        }));
      },

      resetProjects: () => set({ projects: [], activeProjectId: '' }),
    }),
    {
      name: 'meraj_os_projects',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
