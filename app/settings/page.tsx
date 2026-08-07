'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Volume2,
  Timer,
  Check,
  Cloud,
  CloudOff,
  RefreshCw,
  User,
  Calendar,
  CheckSquare,
  Mail,
  MailCheck,
  MailX,
  LayoutGrid,
  Sliders,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useResearchStore } from '../../store/useResearchStore';
import { useCareerStore } from '../../store/useCareerStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useWeeklyStore } from '../../store/useWeeklyStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Logo } from '../../components/common/Logo';
import { OnboardingModal } from '../../components/onboarding/OnboardingModal';
import { BRAND } from '../../lib/branding';
import { ModuleKey } from '../../types';

const MODULE_OPTIONS: { key: ModuleKey; label: string; description: string; alwaysOn?: boolean }[] = [
  { key: 'tasks',          label: 'Tasks',            description: 'Daily task management & priorities', alwaysOn: true },
  { key: 'calendar',       label: 'Calendar',         description: 'Events, meetings & scheduling',      alwaysOn: true },
  { key: 'habits',         label: 'Habits',           description: 'Daily habits & streak tracking' },
  { key: 'goals',          label: 'Goals',            description: 'Long & short term goals' },
  { key: 'notes',          label: 'Notes',            description: 'Notes, ideas & brain dump' },
  { key: 'weekly_planner', label: 'Weekly Planner',   description: 'Week planning & reviews' },
  { key: 'analytics',      label: 'Analytics',        description: 'Productivity charts & insights' },
  { key: 'clients',        label: 'Client Projects',  description: 'Manage clients, bugs & features' },
  { key: 'research',       label: 'Research',         description: 'Papers, thesis & writing tracker' },
  { key: 'career',         label: 'Career & DSA',     description: 'Job applications, interviews & DSA' },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const { session, syncState, syncMessage, signIn, signOut, syncNow } = useGoogleAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    if (session?.email && settings.notificationEmail !== session.email) {
      updateSettings({ notificationEmail: session.email });
    }
  }, [session?.email, settings.notificationEmail, updateSettings]);

  const { resetTasks } = useTaskStore();
  const { resetProjects } = useProjectStore();
  const { resetResearch } = useResearchStore();
  const { resetCareer } = useCareerStore();
  const { resetHabits } = useHabitStore();
  const { resetGoals } = useGoalStore();
  const { resetNotes } = useNotesStore();
  const { resetCalendar } = useCalendarStore();
  const { resetWeekly } = useWeeklyStore();

  const handleExportData = () => {
    const data = {
      tasks: localStorage.getItem('meraj_os_tasks'),
      calendar: localStorage.getItem('meraj_os_calendar'),
      projects: localStorage.getItem('meraj_os_projects'),
      research: localStorage.getItem('meraj_os_research'),
      career: localStorage.getItem('meraj_os_career'),
      habits: localStorage.getItem('meraj_os_habits'),
      goals: localStorage.getItem('meraj_os_goals'),
      notes: localStorage.getItem('meraj_os_notes'),
      settings: localStorage.getItem('meraj_os_settings'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.tasks) localStorage.setItem('meraj_os_tasks', data.tasks);
        if (data.projects) localStorage.setItem('meraj_os_projects', data.projects);
        alert('🎉 Data Backup Successfully Restored! Refreshing page...');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset Meraj OS to initial seed state?')) {
      resetTasks();
      resetProjects();
      resetResearch();
      resetCareer();
      resetHabits();
      resetGoals();
      resetNotes();
      resetCalendar();
      resetWeekly();
      resetSettings();
      alert(`${BRAND.name} reset to initial state!`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Google Sync & System Preferences
            </h1>
            <p className="text-xs text-gray-500">
              Manage Google Calendar & Tasks integration, email notification preferences, and local data cache
            </p>
          </div>
        </div>
      </div>

      {/* Google Account & Sync Status Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Google Account & Synchronization
            </h2>
          </div>

          <button
            onClick={syncNow}
            disabled={syncState === 'syncing'}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncState === 'syncing' ? 'Syncing...' : 'Manual Sync Now'}</span>
          </button>
        </div>

        {session ? (
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={session.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.name || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {session.name || 'Merajul Haque'}
                  </h3>
                  <span className="text-xs text-gray-400 block">{session.email}</span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Disconnect
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-gray-500 uppercase text-[10px] block">
                  Connected Google Calendars
                </span>
                {session.connectedCalendars.map((cal) => (
                  <div key={cal.id} className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>{cal.summary}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-gray-500 uppercase text-[10px] block">
                  Connected Google Task Lists
                </span>
                {session.connectedTaskLists.map((lst) => (
                  <div key={lst.id} className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lst.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-center space-y-3">
            <User className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500">
              Connect your Google Account to synchronize Google Tasks and Google Calendar events automatically.
            </p>
            <button
              onClick={signIn}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs"
            >
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {/* === Workspace Personalisation === */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Your Workspace</h2>
              <p className="text-xs text-gray-500">Toggle which sections appear in your sidebar</p>
            </div>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            Re-run Setup
          </button>
        </div>

        {settings.onboarding?.displayName && (
          <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 font-medium">
            ✦ Workspace configured for <strong>{settings.onboarding.displayName}</strong> · Role: <strong className="capitalize">{settings.onboarding.role}</strong>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MODULE_OPTIONS.map((mod) => {
            const enabled = mod.alwaysOn || (settings.onboarding?.enabledModules ?? []).includes(mod.key);
            const handleToggle = () => {
              if (mod.alwaysOn) return;
              const current: ModuleKey[] = settings.onboarding?.enabledModules ?? [];
              const next: ModuleKey[] = enabled
                ? current.filter((m) => m !== mod.key)
                : [...current, mod.key];
              updateSettings({
                onboarding: {
                  ...(settings.onboarding ?? {
                    displayName: '',
                    role: 'custom',
                    enabledModules: [],
                    workStartTime: '09:00',
                    workEndTime: '18:00',
                    primaryGoal: '',
                    onboardingCompleted: true,
                  }),
                  enabledModules: next,
                },
              });
            };
            return (
              <button
                key={mod.key}
                onClick={handleToggle}
                disabled={mod.alwaysOn}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  enabled
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                } ${mod.alwaysOn ? 'cursor-default' : 'hover:shadow-sm'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  enabled ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {enabled && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold ${
                    enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {mod.label}
                    {mod.alwaysOn && (
                      <span className="ml-1.5 text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Always on</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{mod.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Email Performance Log Switch Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Daily Email Task Log
              </h2>
              <p className="text-xs text-gray-500">
                Receive automated task logs via email at 11:45 PM or on manual cron execution
              </p>
            </div>
          </div>

          {/* Toggle Switch Button */}
          <button
            onClick={() =>
              updateSettings({
                emailNotificationsEnabled: !(settings.emailNotificationsEnabled ?? true),
              })
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
              (settings.emailNotificationsEnabled ?? true)
                ? 'btn-primary'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {(settings.emailNotificationsEnabled ?? true) ? (
              <>
                <MailCheck className="w-4 h-4" />
                <span>Receive Emails (ON)</span>
              </>
            ) : (
              <>
                <MailX className="w-4 h-4" />
                <span>Emails Muted (OFF)</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
          <label className="text-xs font-extrabold text-gray-700 dark:text-gray-300 block">
            Notification Recipient Email Address
          </label>
          <input
            type="email"
            readOnly
            disabled
            value={session?.email || settings.notificationEmail || 'No Google Account Connected'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 cursor-not-allowed select-none opacity-90 font-medium"
          />
          <p className="text-[11px] text-gray-400">
            Automatically synchronized with your signed-in Google Account (non-editable).
          </p>
          <p className="text-[11px] text-gray-400">
            Current Status:{' '}
            <strong className={(settings.emailNotificationsEnabled ?? true) ? 'text-emerald-500' : 'text-amber-500'}>
              {(settings.emailNotificationsEnabled ?? true)
                ? '● Active — daily task log emails will be delivered.'
                : '○ Disabled — email delivery is paused.'}
            </strong>
          </p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          Appearance & Theme
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 font-bold'
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 font-bold'
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Moon className="w-6 h-6 text-blue-500" />
            <span className="text-xs">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Local Data Backup & Restore */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          Data Backup & IndexedDB Cache
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="btn-primary p-4 rounded-xl text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON Backup
          </button>

          <label className="btn-secondary p-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import JSON Backup
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          <button
            onClick={handleResetAll}
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data to Default
          </button>
        </div>
      </div>

      {/* About Orbit Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Logo variant="horizontal" size={32} showTagline={true} />
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900">
            v{BRAND.version}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          Orbit is an intelligent productivity platform designed to help professionals, students, developers, researchers, and creators organize their work, stay focused, and make consistent progress toward their goals.
        </p>
      </div>

      {/* Re-run Setup modal trigger from Settings */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
