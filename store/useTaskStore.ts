import { create } from 'zustand';
import { Task, TaskStatus } from '../types';
import { db } from '../database/dexie';
import { syncService } from '../services/google/sync.service';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';
import { deduplicateTasks } from '../lib/taskUtils';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedStatus: string;
  customFocusTaskId: string | null;

  // Actions
  loadFromDB: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterPriority: (priority: string) => void;
  setFilterStatus: (status: string) => void;
  setCustomFocusTaskId: (id: string | null) => void;

  addTask: (task: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  toggleMIT: (id: string) => Promise<void>;
  resetTasks: () => Promise<void>;
}

export function deduplicateTasksList(tasks: Task[]): { uniqueTasks: Task[]; duplicateIds: string[] } {
  return deduplicateTasks(tasks);
}

export const useTaskStore = create<TaskState>((set, get) => {
  if (typeof window !== 'undefined') {
    db.tasks.toArray().then(async (items) => {
      const { uniqueTasks, duplicateIds } = deduplicateTasksList(items || []);
      set({ tasks: uniqueTasks, isLoading: false });
      if (duplicateIds.length > 0) {
        await db.tasks.bulkDelete(duplicateIds);
      }
    });

    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      const headers = await getAuthHeaders();
      fetch('/api/tasks', { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then(async (data) => {
          if (data && data.tasks && data.tasks.length > 0) {
            const { uniqueTasks } = deduplicateTasksList(data.tasks);
            set({ tasks: uniqueTasks, isLoading: false });
            await db.tasks.bulkPut(uniqueTasks);
          } else {
            set({ isLoading: false });
          }
        })
        .catch((err) => {
          console.warn('[MongoDB TaskSync] Offline or API unreachable', err);
          set({ isLoading: false });
        });
    });
  }

  return {
    tasks: [],
    isLoading: true,
    searchQuery: '',
    selectedCategory: 'all',
    selectedPriority: 'all',
    selectedStatus: 'all',
    customFocusTaskId: typeof window !== 'undefined' ? localStorage.getItem('meraj_os_custom_focus_task_id') : null,

    loadFromDB: async () => {
      set({ isLoading: true });
      const items = await db.tasks.toArray();
      const { uniqueTasks, duplicateIds } = deduplicateTasksList(items || []);
      set({ tasks: uniqueTasks, isLoading: false });
      if (duplicateIds.length > 0) {
        await db.tasks.bulkDelete(duplicateIds);
      }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterCategory: (category) => set({ selectedCategory: category }),
    setFilterPriority: (priority) => set({ selectedPriority: priority }),
    setFilterStatus: (status) => set({ selectedStatus: status }),
    setCustomFocusTaskId: (id: string | null) => {
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem('meraj_os_custom_focus_task_id', id);
        } else {
          localStorage.removeItem('meraj_os_custom_focus_task_id');
        }
      }
      set({ customFocusTaskId: id });
    },

    addTask: async (taskData) => {
      const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTask: Task = {
        ...taskData,
        id,
        syncStatus: 'pending',
        lastSyncedAt: new Date().toISOString(),
      };

      await db.tasks.add(newTask);
      set((state) => ({ tasks: [newTask, ...state.tasks] }));

      // Save to MongoDB API with auth headers
      const headers = await getAuthHeaders();
      fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(newTask),
      }).catch((err) => console.warn('Failed to post task to MongoDB API', err));

      // Queue background sync to Google Tasks
      syncService.queueMutation('create', 'task', id, newTask);
      return id;
    },

    updateTask: async (id, updates) => {
      const existing = get().tasks.find((t) => t.id === id);
      if (!existing) return;

      const updatedTask = { ...existing, ...updates, syncStatus: 'pending' as const };
      await db.tasks.update(id, updatedTask);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));

      // Update in MongoDB API with auth headers
      const headers = await getAuthHeaders();
      fetch('/api/tasks', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedTask),
      }).catch((err) => console.warn('Failed to update task in MongoDB API', err));

      syncService.queueMutation('update', 'task', id, updatedTask);
    },

    deleteTask: async (id) => {
      const existing = get().tasks.find((t) => t.id === id);
      await db.tasks.delete(id);

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));

      // Delete from MongoDB API with auth headers
      const headers = await getAuthHeaders();
      fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      }).catch((err) => console.warn('Failed to delete task from MongoDB API', err));

      if (existing) {
        syncService.queueMutation('delete', 'task', id, existing);
      }
    },

    toggleTaskStatus: async (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
      const actualHours = nextStatus === 'completed' ? task.estimatedHours : 0;

      await get().updateTask(id, {
        status: nextStatus,
        actualHours,
      });
    },

    toggleMIT: async (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      await get().updateTask(id, {
        mit: !task.mit,
      });
    },

    resetTasks: async () => {
      await db.tasks.clear();
      set({ tasks: [] });
    },
  };
});
