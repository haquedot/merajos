'use client';

import React, { useState } from 'react';
import { ShieldAlert, Mail, Send, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, note }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit access request');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Beta Tester Access"
      maxWidth="lg"
    >
      {!submitted ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
              Google OAuth Unverified App Notice
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Orbit</strong> is currently in restricted Google Beta testing. Your Google Account needs developer authorization to enable direct Google Tasks &amp; Calendar sync.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Your Google Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Note for Administrator (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly state your purpose or project access..."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Access Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </form>

          {/* Guest Mode Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
              <strong>You can use Guest Mode right now!</strong> All local tasks, habits, career tracking, and note-taking features are fully functional offline without requiring Google authorization.
            </p>
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="py-4 text-center space-y-5">
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Access Request Submitted!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              An email has been dispatched to the Orbit admin (<strong className="text-slate-900 dark:text-white">haquedot@gmail.com</strong>) and a confirmation email was sent to <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong>.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
            You will receive full access as soon as the developer adds your email to the Google Cloud Console testing list.
          </div>

          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Return to Workspace
          </button>
        </div>
      )}
    </Modal>
  );
};
