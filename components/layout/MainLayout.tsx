'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { RightProductivityPanel } from './RightProductivityPanel';
import { QuickAddModal } from '../modals/QuickAddModal';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { PlatformTourModal } from '../tour/PlatformTourModal';
import { GuestModeBanner } from './GuestModeBanner';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const { settings, isLoadingSettings } = useSettingsStore();
  const { session } = useGoogleAuth();

  // Hydrate dark class on initial load
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Global Ctrl + K / Cmd + K keyboard shortcut listener to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load settings from DB on layout mount
  useEffect(() => {
    useSettingsStore.getState().loadFromDB();
  }, []);

  // Onboarding gate: only show for signed-in users after settings are loaded and if never completed
  useEffect(() => {
    if (isLoadingSettings) return; // wait for DB load
    if (!session) return;          // skip for guests

    const localCompleted = typeof window !== 'undefined' && localStorage.getItem('orbit_onboarding_completed') === 'true';
    const dbCompleted = !!settings.onboarding?.onboardingCompleted;

    if (!localCompleted && !dbCompleted) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [isLoadingSettings, session, settings.onboarding?.onboardingCompleted]);

  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbit_onboarding_completed', 'true');
    }
    useSettingsStore.getState().completeOnboarding();
    setShowOnboarding(false);
    setShowTour(true); // Launch platform tour immediately after onboarding completion
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] transition-colors selection:bg-[#1F3B99] selection:text-white">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenTour={() => setShowTour(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Right Productivity Panel */}
      <RightProductivityPanel
        isOpen={rightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
      />

      {/* Modals */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Onboarding — shown for signed-in users who haven't completed setup */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Platform Tour — shown right after onboarding or when clicked via Navbar */}
      <PlatformTourModal
        isOpen={showTour}
        onClose={() => setShowTour(false)}
      />

      {/* Guest mode banner — shown for unauthenticated users */}
      <GuestModeBanner />
    </div>
  );
};

