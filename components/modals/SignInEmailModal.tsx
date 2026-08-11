'use client';

import React, { useState } from 'react';
import { LogIn, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface SignInEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOAuth: () => Promise<void>;
  onRequestAccess: (email: string) => void;
}

export const SignInEmailModal: React.FC<SignInEmailModalProps> = ({
  isOpen,
  onClose,
  onProceedToOAuth,
  onRequestAccess,
}) => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    setIsChecking(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/check-access?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.allowed) {
        // Email is developer-approved — proceed with Google OAuth popup
        onClose();
        await onProceedToOAuth();
      } else {
        // Email not approved — skip the 403 popup, open Request Access flow
        onClose();
        onRequestAccess(email);
      }
    } catch (err: any) {
      console.warn('Check access failed, falling back to direct sign in', err);
      onClose();
      await onProceedToOAuth();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In to Orbit" maxWidth="md">
      <div className="space-y-5">
        {/* Icon + subtitle */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <LogIn className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            Enter your Google Account email to verify tester authorization before connecting.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Google Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isChecking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pre-verified OAuth
          </span>
          <button
            onClick={() => {
              onClose();
              onRequestAccess(email);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Request Beta Access →
          </button>
        </div>
      </div>
    </Modal>
  );
};
