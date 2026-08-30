import { create } from 'zustand';
import { UserAIModelConfig } from '../lib/agent/types';
import { obfuscateKey, deobfuscateKey } from '../lib/security/keyCrypto';

const STORAGE_KEY = 'meraj_os_user_ai_models';
const ACTIVE_MODEL_STORAGE_KEY = 'meraj_os_active_ai_model_id';

interface AIConfigState {
  configs: UserAIModelConfig[];
  activeModelId: string | null;
  
  // Actions
  loadFromStorage: () => void;
  addModelConfig: (configData: Omit<UserAIModelConfig, 'id' | 'createdAt'>) => string;
  updateModelConfig: (id: string, updates: Partial<UserAIModelConfig>) => void;
  deleteModelConfig: (id: string) => void;
  setActiveModelId: (id: string | null) => void;
  getActiveConfig: () => UserAIModelConfig | null;
}

export const useAIConfigStore = create<AIConfigState>((set, get) => {
  // Initial hydrate from browser storage
  let initialConfigs: UserAIModelConfig[] = [];
  let initialActiveId: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        initialConfigs = parsed.map((item: any) => ({
          ...item,
          apiKey: deobfuscateKey(item.apiKey || ''),
        }));
      }
      initialActiveId = localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY);
    } catch (e) {
      console.warn('[AIConfigStore] Failed to load custom AI models from localStorage', e);
    }
  }

  const persistConfigs = (configs: UserAIModelConfig[]) => {
    if (typeof window === 'undefined') return;
    try {
      const toStore = configs.map((cfg) => ({
        ...cfg,
        apiKey: obfuscateKey(cfg.apiKey || ''),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('[AIConfigStore] Failed to persist custom AI models', e);
    }
  };

  return {
    configs: initialConfigs,
    activeModelId: initialActiveId,

    loadFromStorage: () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const loaded = parsed.map((item: any) => ({
            ...item,
            apiKey: deobfuscateKey(item.apiKey || ''),
          }));
          set({ configs: loaded });
        }
        const active = localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY);
        set({ activeModelId: active });
      } catch (e) {
        console.warn('[AIConfigStore] loadFromStorage error', e);
      }
    },

    addModelConfig: (configData) => {
      const id = `cfg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newConfig: UserAIModelConfig = {
        ...configData,
        id,
        createdAt: new Date().toISOString(),
        isActive: configData.isActive ?? true,
      };

      const updated = [newConfig, ...get().configs];
      set({ configs: updated, activeModelId: newConfig.isActive ? id : get().activeModelId });

      persistConfigs(updated);
      if (newConfig.isActive && typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, id);
      }

      return id;
    },

    updateModelConfig: (id, updates) => {
      const updated = get().configs.map((cfg) =>
        cfg.id === id ? { ...cfg, ...updates } : cfg
      );
      set({ configs: updated });
      persistConfigs(updated);
    },

    deleteModelConfig: (id) => {
      const updated = get().configs.filter((cfg) => cfg.id !== id);
      const nextActiveId = get().activeModelId === id ? (updated[0]?.id || null) : get().activeModelId;

      set({ configs: updated, activeModelId: nextActiveId });
      persistConfigs(updated);

      if (typeof window !== 'undefined') {
        if (nextActiveId) {
          localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, nextActiveId);
        } else {
          localStorage.removeItem(ACTIVE_MODEL_STORAGE_KEY);
        }
      }
    },

    setActiveModelId: (id) => {
      set({ activeModelId: id });
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, id);
        } else {
          localStorage.removeItem(ACTIVE_MODEL_STORAGE_KEY);
        }
      }
    },

    getActiveConfig: () => {
      const { configs, activeModelId } = get();
      if (!activeModelId) return configs[0] || null;
      return configs.find((c) => c.id === activeModelId) || configs[0] || null;
    },
  };
});
