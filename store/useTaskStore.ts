import { create } from 'zustand';
import { Task, TaskStatus, Priority, Category } from '../types';
import { db } from '../database/dexie';
import { syncService } from '../services/google/sync.service';
import { isUserAuthenticated } from '../lib/authCheck';

interface TaskState {
  tasks: Task[];
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedStatus: string;

  // Actions
  loadFromDB: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterPriority: (priority: string) => void;
  setFilterStatus: (status: string) => void;

  addTask: (task: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  toggleMIT: (id: string) => Promise<void>;
  resetTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => {
  // Load real data from Dexie DB & MongoDB API (if authenticated)
  if (typeof window !== 'undefined') {
    db.tasks.toArray().then((items) => {
      set({ tasks: items || [] });
    });

    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return; // Guest mode: Dexie only
      fetch('/api/tasks')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.tasks && data.tasks.length > 0) {
            set({ tasks: data.tasks });
            db.tasks.bulkPut(data.tasks);
          }
        })
        .catch((err) => console.warn('[MongoDB TaskSync] Offline or API unreachable', err));
    });
  }

  return {
    tasks: [],
    searchQuery: '',
    selectedCategory: 'all',
    selectedPriority: 'all',
    selectedStatus: 'all',

    loadFromDB: async () => {
      const items = await db.tasks.toArray();
      set({ tasks: items || [] });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterCategory: (category) => set({ selectedCategory: category }),
    setFilterPriority: (priority) => set({ selectedPriority: priority }),
    setFilterStatus: (status) => set({ selectedStatus: status }),

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

      // Save to MongoDB API
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Update in MongoDB API
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

      // Delete from MongoDB API
      fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
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
