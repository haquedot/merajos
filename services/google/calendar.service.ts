import { authService } from './auth.service';
import { CalendarEvent, Category } from '../../types';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

export class GoogleCalendarService {
  private async getHeaders(): Promise<HeadersInit | null> {
    const token = await authService.getAccessToken();
    if (!token || token.startsWith('demo_')) return null;
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public async fetchCalendars(): Promise<any[]> {
    const headers = await this.getHeaders();
    if (!headers) return [];

    try {
      const res = await fetch(`${BASE_URL}/users/me/calendarList`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.warn('[CalendarService] Error fetching calendar list:', err);
      return [];
    }
  }

  public async fetchEvents(calendarId: string = 'primary'): Promise<CalendarEvent[]> {
    const headers = await this.getHeaders();
    if (!headers) return [];

    try {
      const timeMin = new Date(Date.now() - 30 * 86400000).toISOString();
      const res = await fetch(`${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&singleEvents=true`, { headers });
      if (!res.ok) return [];
      const data = await res.json();

      return (data.items || []).map((item: any) => this.mapGoogleEventToMeraj(item));
    } catch (err) {
      console.warn('[CalendarService] Error fetching events:', err);
      return [];
    }
  }

  public async createEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<CalendarEvent | null> {
    const headers = await this.getHeaders();
    if (!headers) return null;

    const body = {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: `${event.startDate}T${event.startTime || '09:00'}:00Z`,
      },
      end: {
        dateTime: `${event.endDate}T${event.endTime || '10:00'}:00Z`,
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return this.mapGoogleEventToMeraj(data);
    } catch (err) {
      console.warn('[CalendarService] Error creating event:', err);
      return null;
    }
  }

  public async updateEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<boolean> {
    if (!event.googleEventId) return false;
    const headers = await this.getHeaders();
    if (!headers) return false;

    const body = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: `${event.startDate}T${event.startTime || '09:00'}:00Z`,
      },
      end: {
        dateTime: `${event.endDate}T${event.endTime || '10:00'}:00Z`,
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${event.googleEventId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch (err) {
      console.warn('[CalendarService] Error updating event:', err);
      return false;
    }
  }

  public async deleteEvent(googleEventId: string, calendarId: string = 'primary'): Promise<boolean> {
    const headers = await this.getHeaders();
    if (!headers) return false;

    try {
      const res = await fetch(`${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch (err) {
      console.warn('[CalendarService] Error deleting event:', err);
      return false;
    }
  }

  private mapGoogleEventToMeraj(item: any): CalendarEvent {
    const startStr = item.start?.dateTime || item.start?.date || new Date().toISOString();
    const endStr = item.end?.dateTime || item.end?.date || new Date().toISOString();

    const startDate = startStr.split('T')[0];
    const endDate = endStr.split('T')[0];
    const startTime = startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : '09:00';
    const endTime = endStr.includes('T') ? endStr.split('T')[1].substring(0, 5) : '10:00';

    let category: Category = 'Personal';
    if (item.summary?.toLowerCase().includes('research') || item.summary?.toLowerCase().includes('thesis')) {
      category = 'Research';
    } else if (item.summary?.toLowerCase().includes('client') || item.summary?.toLowerCase().includes('sanab')) {
      category = 'Client';
    } else if (item.summary?.toLowerCase().includes('interview') || item.summary?.toLowerCase().includes('dsa')) {
      category = 'Career';
    }

    return {
      id: item.id,
      googleEventId: item.id,
      title: item.summary || 'Untitled Event',
      startDate,
      endDate,
      startTime,
      endTime,
      category,
      color: item.colorId ? '#3b82f6' : '#8b5cf6',
      description: item.description || '',
      location: item.location || '',
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
