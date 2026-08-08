'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone, Check } from 'lucide-react';
import { Logo } from '../common/Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // Check if user previously dismissed prompt
    const isDismissed = localStorage.getItem('orbit_pwa_dismissed') === 'true';

    // Check for iOS Safari
    const ua = window.navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
    setIsIOS(iosDevice && isSafari);

    if (iosDevice && isSafari && !isDismissed) {
      setShowPrompt(true);
    }

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('orbit_pwa_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Mobile Install App Bottom Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-900/60 p-4 rounded-2xl shadow-xl space-y-3 transition-all animate-in slide-in-from-bottom-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size={32} />
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                Install Orbit App
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Add to your mobile home screen for fast offline access & app experience.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 btn-primary py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Instructions for iPhone' : 'Install App'}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Steps Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-in zoom-in-95 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Add Orbit to iPhone Home Screen
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Follow these simple steps in Safari browser:
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> <strong>Share</strong> button at bottom of Safari.</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Tap <strong>"Add"</strong> in top right corner.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
