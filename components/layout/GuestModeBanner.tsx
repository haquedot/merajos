'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Wifi } from 'lucide-react';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

/**
 * Guest mode banner — shown at the bottom of the page for unauthenticated users.
 * Informs them that their data is local-only and invites them to sign in.
 */
export const GuestModeBanner: React.FC = () => {
  const { session, signIn } = useGoogleAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only show if not signed in and not dismissed
  if (session || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0b1120] dark:bg-[#1e293b] border border-blue-800/50 shadow-2xl shadow-black/30 backdrop-blur-md">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-blue-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">You're using Orbit as a guest</p>
            <p className="text-[11px] text-blue-300/70 leading-snug">
              Your tasks are saved locally. Sign in to sync across devices.
            </p>
          </div>

          {/* Sign in button */}
          <button
            onClick={signIn}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95"
          >
            <LogIn className="w-3 h-3" />
            Sign In
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
