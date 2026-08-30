'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, LogIn, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  title = 'Authentication Required',
  description = 'Omini AI Assistant requires an active Google account login to perform workspace actions and generate personalized schedules.',
}) => {
  const { signIn } = useGoogleAuth();

  const handleSignIn = async () => {
    onClose();
    await signIn();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="relative overflow-hidden p-1 z-100">
        {/* Top Glow Accent */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/20 dark:bg-amber-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 text-center py-2">
          {/* Animated Icon Badge with Moving Border */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl p-[2px] overflow-hidden shadow-xl shadow-blue-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-100 pointer-events-none"
            />
            <div className="relative z-10 w-full h-full rounded-[calc(1rem-2px)] bg-slate-900 dark:bg-[#0b1120] text-white flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
          </div>

          {/* Heading and Copy */}
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-xs mx-auto pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer border border-blue-400/30"
            >
              {/* Custom SVG Google G Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Sign in with Google</span>
            </motion.button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Security footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
            <ShieldAlert className="w-3 h-3 text-emerald-500" />
            <span>Secure 256-bit SSL authentication via Google OAuth 2.0</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthRequiredModal;
