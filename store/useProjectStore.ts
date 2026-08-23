import { create } from 'zustand';
import { Project, ProjectFeature, ProjectBug, ProjectInvoice } from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;

  loadFromDB: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProjectId: (id: string) => void;

  toggleFeature: (projectId: string, featureId: string) => Promise<void>;
  addFeature: (projectId: string, feature: Omit<ProjectFeature, 'id'> | string) => Promise<void>;
  deleteFeature: (projectId: string, featureId: string) => Promise<void>;
  
  addBug: (projectId: string, bug: Omit<ProjectBug, 'id'>) => Promise<void>;
  updateBugStatus: (projectId: string, bugId: string, status: ProjectBug['status']) => Promise<void>;
  deleteBug: (projectId: string, bugId: string) => Promise<void>;

  addInvoice: (projectId: string, invoice: Omit<ProjectInvoice, 'id'>) => Promise<void>;
  updateInvoiceStatus: (projectId: string, invoiceId: string, status: ProjectInvoice['status']) => Promise<void>;
  deleteInvoice: (projectId: string, invoiceId: string) => Promise<void>;

  saveProjectNotes: (projectId: string, notes: string) => Promise<void>;
  
  resetProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => {
  // Sync with MongoDB API on store load (if authenticated)
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/projects', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.projects) {
            set({ projects: data.projects });
          }
        }
      } catch (err) {
        console.warn('[MongoDB ProjectSync] Offline or API unreachable', err);
      }
    });
  }

  return {
    projects: [],
    activeProjectId: '',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/projects', { headers });
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
        invoices: data.invoices || [],
        features: data.features || [],
        bugs: data.bugs || [],
      };

      set((state) => ({
        projects: [newProj, ...state.projects],
        activeProjectId: state.activeProjectId || newId,
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/projects', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newProj),
        });
      } catch (err) {
        console.warn('Failed to save project to MongoDB API', err);
      }

      return newId;
    },

    updateProject: async (id, updates) => {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/projects', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });
      } catch (err) {
        console.warn('Failed to update project in MongoDB API', err);
      }
    },

    deleteProject: async (id) => {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? '' : state.activeProjectId,
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch(`/api/projects?id=${id}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.warn('Failed to delete project from MongoDB API', err);
      }
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

    addFeature: async (projectId, featureInput) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const newFeature: ProjectFeature = typeof featureInput === 'string'
        ? { id: `f-${Date.now()}`, title: featureInput, completed: false, priority: 'medium' }
        : { ...featureInput, id: `f-${Date.now()}` };

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

    deleteFeature: async (projectId, featureId) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedFeatures = currentProj.features.filter((f) => f.id !== featureId);
      const completedCount = updatedFeatures.filter((f) => f.completed).length;
      const newProgress = updatedFeatures.length > 0
        ? Math.round((completedCount / updatedFeatures.length) * 100)
        : 0;

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, features: updatedFeatures, progress: newProgress } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, features: updatedFeatures, progress: newProgress }),
      }).catch((err) => console.warn('Failed to delete feature in MongoDB API', err));
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

    deleteBug: async (projectId, bugId) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedBugs = currentProj.bugs.filter((b) => b.id !== bugId);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, bugs: updatedBugs } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, bugs: updatedBugs }),
      }).catch((err) => console.warn('Failed to delete bug in MongoDB API', err));
    },

    addInvoice: async (projectId, invoiceData) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const newInvoice: ProjectInvoice = {
        ...invoiceData,
        id: `inv-${Date.now()}`,
      };

      const updatedInvoices = [...(currentProj.invoices || []), newInvoice];
      const newAmountPaid = updatedInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, invoices: updatedInvoices, amountPaid: newAmountPaid } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, invoices: updatedInvoices, amountPaid: newAmountPaid }),
      }).catch((err) => console.warn('Failed to add invoice to MongoDB API', err));
    },

    updateInvoiceStatus: async (projectId, invoiceId, status) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedInvoices = (currentProj.invoices || []).map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : inv.paidDate,
            }
          : inv
      );

      const newAmountPaid = updatedInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, invoices: updatedInvoices, amountPaid: newAmountPaid } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, invoices: updatedInvoices, amountPaid: newAmountPaid }),
      }).catch((err) => console.warn('Failed to update invoice in MongoDB API', err));
    },

    deleteInvoice: async (projectId, invoiceId) => {
      const currentProj = get().projects.find((p) => p.id === projectId);
      if (!currentProj) return;

      const updatedInvoices = (currentProj.invoices || []).filter((inv) => inv.id !== invoiceId);
      const newAmountPaid = updatedInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, invoices: updatedInvoices, amountPaid: newAmountPaid } : p
        ),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, invoices: updatedInvoices, amountPaid: newAmountPaid }),
      }).catch((err) => console.warn('Failed to delete invoice in MongoDB API', err));
    },

    saveProjectNotes: async (projectId, notes) => {
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? { ...p, notes } : p)),
      }));

      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, notes }),
      }).catch((err) => console.warn('Failed to save project notes to MongoDB API', err));
    },

    resetProjects: () => set({ projects: [], activeProjectId: '' }),
  };
});
