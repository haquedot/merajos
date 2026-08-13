export type ProjectColorKey =
  | 'indigo'
  | 'purple'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'pink'
  | 'cyan'
  | 'rose';

export interface ProjectColorTheme {
  name: ProjectColorKey;
  label: string;
  hex: string;
  bg: string;
  bgHover: string;
  bgLight: string;
  text: string;
  border: string;
  ring: string;
  badgeVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  headerBadgeVariant: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'gray';
}

export const PROJECT_COLOR_MAP: Record<ProjectColorKey, ProjectColorTheme> = {
  indigo: {
    name: 'indigo',
    label: 'Indigo',
    hex: '#6366f1',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    ring: 'ring-indigo-500',
    badgeVariant: 'purple',
    headerBadgeVariant: 'purple',
  },
  purple: {
    name: 'purple',
    label: 'Purple',
    hex: '#8b5cf6',
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    ring: 'ring-purple-500',
    badgeVariant: 'purple',
    headerBadgeVariant: 'purple',
  },
  blue: {
    name: 'blue',
    label: 'Blue',
    hex: '#3b82f6',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    ring: 'ring-blue-500',
    badgeVariant: 'primary',
    headerBadgeVariant: 'blue',
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald',
    hex: '#10b981',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-500',
    badgeVariant: 'success',
    headerBadgeVariant: 'emerald',
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    hex: '#f59e0b',
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-500',
    badgeVariant: 'warning',
    headerBadgeVariant: 'amber',
  },
  pink: {
    name: 'pink',
    label: 'Pink',
    hex: '#ec4899',
    bg: 'bg-pink-600',
    bgHover: 'hover:bg-pink-700',
    bgLight: 'bg-pink-50 dark:bg-pink-950/40',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    ring: 'ring-pink-500',
    badgeVariant: 'purple',
    headerBadgeVariant: 'purple',
  },
  cyan: {
    name: 'cyan',
    label: 'Cyan',
    hex: '#06b6d4',
    bg: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    ring: 'ring-cyan-500',
    badgeVariant: 'info',
    headerBadgeVariant: 'blue',
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    hex: '#f43f5e',
    bg: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    ring: 'ring-rose-500',
    badgeVariant: 'danger',
    headerBadgeVariant: 'rose',
  },
};

const HEX_TO_KEY: Record<string, ProjectColorKey> = {
  '#6366f1': 'indigo',
  '#8b5cf6': 'purple',
  '#3b82f6': 'blue',
  '#10b981': 'emerald',
  '#f59e0b': 'amber',
  '#ec4899': 'pink',
  '#06b6d4': 'cyan',
  '#f43f5e': 'rose',
  '#ef4444': 'rose',
};

export function getProjectTheme(color?: string): ProjectColorTheme {
  if (!color) return PROJECT_COLOR_MAP.indigo;
  const lower = color.toLowerCase();
  if (PROJECT_COLOR_MAP[lower as ProjectColorKey]) {
    return PROJECT_COLOR_MAP[lower as ProjectColorKey];
  }
  const keyFromHex = HEX_TO_KEY[lower];
  if (keyFromHex && PROJECT_COLOR_MAP[keyFromHex]) {
    return PROJECT_COLOR_MAP[keyFromHex];
  }
  return PROJECT_COLOR_MAP.indigo;
}
