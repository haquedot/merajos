import { authService } from './auth.service';
import { Task, Category, Priority, TaskStatus } from '../../types';
import { parseTimeAndSlotFromText } from '../../lib/taskUtils';

const BASE_URL = 'https://www.googleapis.com/tasks/v1';

export class GoogleTasksService {
  private async getHeaders(): Promise<HeadersInit | null> {
    const token = await authService.getAccessToken();
    if (!token || token.startsWith('demo_')) return null;
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public async fetchTaskLists(): Promise<any[]> {
    const headers = await this.getHeaders();
    if (!headers) return [];

    try {
      const res = await fetch(`${BASE_URL}/users/@me/lists`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.warn('[TasksService] Error fetching task lists:', err);
      return [];
    }
  }

  public async fetchTasksForList(listId: string = '@default'): Promise<Task[]> {
    const headers = await this.getHeaders();
    if (!headers) return [];

    try {
      const res = await fetch(`${BASE_URL}/lists/${encodeURIComponent(listId)}/tasks?showCompleted=true&showHidden=true`, { headers });
      if (!res.ok) return [];
      const data = await res.json();

      return (data.items || []).map((item: any) => this.mapGoogleTaskToMeraj(item, listId));
    } catch (err) {
      console.warn('[TasksService] Error fetching tasks:', err);
      return [];
    }
  }

  public async createTask(task: Task, listId: string = '@default'): Promise<Task | null> {
    const headers = await this.getHeaders();
    if (!headers) return null;

    const isDone = task.status === 'completed';
    const body: any = {
      title: task.title,
      notes: task.description || '',
      due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined,
      status: isDone ? 'completed' : 'needsAction',
    };

    if (isDone) {
      body.completed = new Date().toISOString();
    }

    try {
      const res = await fetch(`${BASE_URL}/lists/${encodeURIComponent(listId)}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return this.mapGoogleTaskToMeraj(data, listId);
    } catch (err) {
      console.warn('[TasksService] Error creating task:', err);
      return null;
    }
  }

  public async updateTask(task: Task, listId: string = '@default'): Promise<boolean> {
    const headers = await this.getHeaders();
    if (!headers) return false;

    if (!task.googleTaskId) {
      const created = await this.createTask(task, listId);
      return !!created;
    }

    const isDone = task.status === 'completed';
    const body: any = {
      id: task.googleTaskId,
      title: task.title,
      notes: task.description || '',
      status: isDone ? 'completed' : 'needsAction',
      due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined,
    };

    if (isDone) {
      body.completed = new Date().toISOString();
    }

    try {
      const res = await fetch(`${BASE_URL}/lists/${encodeURIComponent(listId)}/tasks/${task.googleTaskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch (err) {
      console.warn('[TasksService] Error updating task:', err);
      return false;
    }
  }

  public async deleteTask(googleTaskId: string, listId: string = '@default'): Promise<boolean> {
    const headers = await this.getHeaders();
    if (!headers) return false;

    try {
      const res = await fetch(`${BASE_URL}/lists/${encodeURIComponent(listId)}/tasks/${googleTaskId}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch (err) {
      console.warn('[TasksService] Error deleting task:', err);
      return false;
    }
  }

  private mapGoogleTaskToMeraj(item: any, listId: string): Task {
    const isDone = item.status === 'completed';
    const dueDate = item.due ? item.due.split('T')[0] : new Date().toISOString().split('T')[0];

    let category: Category = 'Personal';
    if (item.title?.toLowerCase().includes('sanab') || listId.includes('sanab')) {
      category = 'Client';
    } else if (item.title?.toLowerCase().includes('thesis') || item.title?.toLowerCase().includes('paper')) {
      category = 'Research';
    } else if (item.title?.toLowerCase().includes('dsa') || item.title?.toLowerCase().includes('interview')) {
      category = 'Career';
    }

    let priority: Priority = 'medium';
    if (item.title?.toLowerCase().includes('urgent') || item.notes?.toLowerCase().includes('urgent')) {
      priority = 'urgent';
    } else if (item.title?.toLowerCase().includes('important') || item.title?.toLowerCase().includes('high')) {
      priority = 'high';
    }

    // Parse time and timeSlot using parseTimeAndSlotFromText
    const { time: taskTime, timeSlot } = parseTimeAndSlotFromText(
      `${item.title || ''} ${item.notes || ''}`,
      item.due
    );

    return {
      id: item.id,
      googleTaskId: item.id,
      title: item.title || 'Untitled Google Task',
      description: item.notes || '',
      priority,
      status: isDone ? 'completed' : 'todo',
      category,
      dueDate,
      time: taskTime,
      timeSlot,
      estimatedHours: 1,
      actualHours: isDone ? 1 : 0,
      recurring: 'none',
      tags: [category],
      mit: priority === 'urgent' || priority === 'high',
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
  }
}

export const googleTasksService = new GoogleTasksService();
