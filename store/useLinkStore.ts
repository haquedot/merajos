import { create } from 'zustand';
import { SavedLink } from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';

const DEFAULT_LINKS: SavedLink[] = [];

interface LinkState {
  links: SavedLink[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onlyFavorites: boolean;
  currentPage: number;
  itemsPerPage: number;

  loadFromDB: () => Promise<void>;
  addLink: (link: Partial<SavedLink>) => Promise<SavedLink>;
  updateLink: (id: string, updates: Partial<SavedLink>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setOnlyFavorites: (onlyFavs: boolean) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  resetFilters: () => void;
}

export const useLinkStore = create<LinkState>((set, get) => {
  // Automatic initial fetch
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) {
        set({ links: DEFAULT_LINKS, isLoading: false });
        return;
      }
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/links', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.links) && data.links.length > 0) {
            set({ links: data.links, isLoading: false });
          } else {
            set({ links: DEFAULT_LINKS, isLoading: false });
          }
        } else {
          set({ links: DEFAULT_LINKS, isLoading: false });
        }
      } catch (err) {
        set({ links: DEFAULT_LINKS, isLoading: false });
      }
    });
  }

  return {
    links: [],
    isLoading: true,
    searchQuery: '',
    selectedCategory: 'All',
    onlyFavorites: false,
    currentPage: 1,
    itemsPerPage: 6,

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/links', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (data.links && Array.isArray(data.links)) {
          set({ links: data.links, isLoading: false });
        }
      } catch (err) {
        console.warn('[LinksStore] Offline or API error', err);
      }
    },

    addLink: async (customData) => {
      const newId = `link-${Date.now()}`;
      const now = new Date().toISOString();
      const newLink: SavedLink = {
        id: newId,
        title: customData.title?.trim() || 'Untitled Link',
        url: customData.url?.trim() || '#',
        description: customData.description?.trim() || '',
        category: customData.category || 'General',
        tags: customData.tags || [],
        isFavorite: customData.isFavorite || false,
        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        links: [newLink, ...state.links],
        currentPage: 1, // Reset to first page when adding
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/links', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newLink),
        });
      } catch (err) {
        console.warn('[LinksStore] Failed to save link to DB', err);
      }

      return newLink;
    },

    updateLink: async (id, updates) => {
      const updatedAt = new Date().toISOString();
      set((state) => ({
        links: state.links.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt } : l
        ),
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/links', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates, updatedAt }),
        });
      } catch (err) {
        console.warn('[LinksStore] Failed to update link in DB', err);
      }
    },

    deleteLink: async (id) => {
      set((state) => ({
        links: state.links.filter((l) => l.id !== id),
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch(`/api/links?id=${id}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.warn('[LinksStore] Failed to delete link from DB', err);
      }
    },

    toggleFavorite: async (id) => {
      let isFav = false;
      set((state) => ({
        links: state.links.map((l) => {
          if (l.id === id) {
            isFav = !l.isFavorite;
            return { ...l, isFavorite: isFav };
          }
          return l;
        }),
      }));

      try {
        const headers = await getAuthHeaders();
        await fetch('/api/links', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isFavorite: isFav }),
        });
      } catch (err) {
        console.warn('[LinksStore] Failed to toggle favorite in DB', err);
      }
    },

    setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
    setSelectedCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
    setOnlyFavorites: (onlyFavs) => set({ onlyFavorites: onlyFavs, currentPage: 1 }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),
    resetFilters: () => set({ searchQuery: '', selectedCategory: 'All', onlyFavorites: false, currentPage: 1 }),
  };
});

