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
      if (!res.ok) {
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          console.error(
            '⚠️ [Google Calendar API Disabled in GCP] Enable Google Calendar API for project 521278307538 at:',
            'https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=521278307538',
            errData
          );
        }
        return [];
      }
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
      // 30 Days in the past to 90 Days in the future (Optimized for productivity planning)
      const timeMin = new Date(Date.now() - 30 * 86400000).toISOString();
      const timeMax = new Date(Date.now() + 90 * 86400000).toISOString();
      
      let allItems: any[] = [];
      let pageToken: string | undefined = undefined;

      do {
        let url = `${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&maxResults=2500`;
        if (pageToken) {
          url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          if (res.status === 401) {
            console.warn('[CalendarService] OAuth token expired or unauthorized (401). Skipping remote event fetch.');
          }
          break;
        }
        
        const data = await res.json();
        if (data.items) {
          allItems.push(...data.items);
        }
        pageToken = data.nextPageToken;
      } while (pageToken);

      return allItems.map((item: any) => this.mapGoogleEventToMeraj(item, calendarId));
    } catch (err) {
      console.warn(`[CalendarService] Error fetching events for ${calendarId}:`, err);
      return [];
    }
  }

  public async fetchAllCalendarsEvents(): Promise<CalendarEvent[]> {
    const calendars = await this.fetchCalendars();
    if (!calendars || calendars.length === 0) {
      return this.fetchEvents('primary');
    }

    const allEventsPromises = calendars.map((cal) => this.fetchEvents(cal.id));
    const eventsArrays = await Promise.all(allEventsPromises);
    
    // Flatten and deduplicate by event ID
    const eventMap = new Map<string, CalendarEvent>();
    eventsArrays.flat().forEach((evt) => {
      eventMap.set(evt.id, evt);
    });

    return Array.from(eventMap.values());
  }

  public async createEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<CalendarEvent | null> {
    const headers = await this.getHeaders();
    if (!headers) return null;

    const isAllDay = !event.startTime || event.startTime === 'All Day';
    
    const body: any = {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
    };

    if (isAllDay) {
      body.start = { date: event.startDate };
      body.end = { date: event.endDate || event.startDate };
    } else {
      body.start = { dateTime: `${event.startDate}T${event.startTime}:00Z` };
      body.end = { dateTime: `${event.endDate || event.startDate}T${event.endTime || '23:59'}:00Z` };
    }

    try {
      const res = await fetch(`${BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return this.mapGoogleEventToMeraj(data, calendarId);
    } catch (err) {
      console.warn('[CalendarService] Error creating event:', err);
      return null;
    }
  }

  public async updateEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<boolean> {
    if (!event.googleEventId) return false;
    const headers = await this.getHeaders();
    if (!headers) return false;

    const isAllDay = !event.startTime || event.startTime === 'All Day';
    const body: any = {
      summary: event.title,
      description: event.description || '',
    };

    if (isAllDay) {
      body.start = { date: event.startDate };
      body.end = { date: event.endDate || event.startDate };
    } else {
      body.start = { dateTime: `${event.startDate}T${event.startTime}:00Z` };
      body.end = { dateTime: `${event.endDate || event.startDate}T${event.endTime || '23:59'}:00Z` };
    }

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

  private mapGoogleEventToMeraj(item: any, calendarId: string): CalendarEvent {
    const isAllDay = !item.start?.dateTime;
    const startStr = item.start?.dateTime || item.start?.date || new Date().toISOString();
    const endStr = item.end?.dateTime || item.end?.date || new Date().toISOString();

    const startDate = startStr.split('T')[0];
    const endDate = endStr.split('T')[0];
    const startTime = isAllDay ? 'All Day' : (startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : '09:00');
    const endTime = isAllDay ? '' : (endStr.includes('T') ? endStr.split('T')[1].substring(0, 5) : '10:00');

    let category: Category = 'Personal';
    if (item.summary?.toLowerCase().includes('research') || item.summary?.toLowerCase().includes('thesis')) {
      category = 'Research';
    } else if (item.summary?.toLowerCase().includes('client') || item.summary?.toLowerCase().includes('sanab') || item.summary?.toLowerCase().includes('meeting')) {
      category = 'Client';
    } else if (item.summary?.toLowerCase().includes('interview') || item.summary?.toLowerCase().includes('dsa') || item.summary?.toLowerCase().includes('work')) {
      category = 'Career';
    }

    const colorMap: Record<string, string> = {
      Client: '#8b5cf6',
      Research: '#3b82f6',
      Career: '#10b981',
      Personal: '#f59e0b',
    };

    return {
      id: item.id,
      googleEventId: item.id,
      title: item.summary || 'Untitled Event',
      startDate,
      endDate,
      startTime,
      endTime,
      category,
      color: colorMap[category] || '#3b82f6',
      description: item.description || '',
      location: item.location || '',
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
