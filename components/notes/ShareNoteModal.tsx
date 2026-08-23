'use client';

import React, { useState } from 'react';
import { Note } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Share2, Globe, Lock, Copy, Check, Mail, Plus, X, LogIn, AlertTriangle, Cloud } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onUpdateShareSettings: (isPublic: boolean, sharedWithEmails: string[]) => Promise<void>;
}

export function ShareNoteModal({
  isOpen,
  onClose,
  note,
  onUpdateShareSettings,
}: ShareNoteModalProps) {
  const { session, signIn } = useGoogleAuth();

  const [isPublic, setIsPublic] = useState<boolean>(note.isPublic || false);
  const [sharedEmails, setSharedEmails] = useState<string[]>(note.sharedWithEmails || []);
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/notes/${note.id}`
    : `/notes/${note.id}`;

  const isAuthenticated = !!session;

  const handleCopyLink = () => {
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to copy and share links.');
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to share notes with specific email addresses.');
      return;
    }
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !sharedEmails.includes(trimmed)) {
      setSharedEmails([...sharedEmails, trimmed]);
      setEmailInput('');
      setErrorMessage(null);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSharedEmails(sharedEmails.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to save share settings.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateShareSettings(isPublic, sharedEmails);
      onClose();
    } catch (err: any) {
      console.warn('Failed to save share settings', err);
      setErrorMessage(err?.message || 'Failed to update share settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Note & Manage Access" maxWidth="md">
      <div className="space-y-5">
        {/* Unauthenticated Alert Banner */}
        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-3">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Sign In Required to Share</span>
            </div>
            <p className="leading-relaxed">
              Notes can be shared publicly or with teammates once you are signed in to your account.
            </p>
            <Button
              type="button"
              onClick={signIn}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </Button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {/* Note Title */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Cloud className="w-3 h-3" />
              <span>Cloud Synced Note</span>
            </div>
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
              {note.title || 'Untitled Note'}
            </h4>
          </div>
          <Badge variant={isPublic ? 'success' : 'outline'} size="sm">
            {isPublic ? 'Public Link Active' : 'Private'}
          </Badge>
        </div>

        {/* Public Access Switch */}
        <div className={`p-4 rounded-2xl border space-y-3 transition-opacity ${
          isAuthenticated
            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
            : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-60 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPublic ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                  Public Link Sharing
                </span>
                <span className="text-[11px] text-gray-400 block">
                  Anyone with the link can view this note
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!isAuthenticated}
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isPublic ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                  isPublic ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Share URL & Copy Button */}
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 focus:outline-hidden"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                disabled={!isAuthenticated}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 bg-orbit-blue hover:bg-orbit-blue-hover text-white"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Email Sharing */}
        <div className={`space-y-3 ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
          <label className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Share directly with specific emails</span>
          </label>

          <form onSubmit={handleAddEmail} className="flex gap-2">
            <Input
              type="email"
              placeholder="user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={!isAuthenticated}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={!isAuthenticated}
              className="px-3 py-2 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </form>

          {sharedEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {sharedEmails.map((email) => (
                <span
                  key={email}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="hover:text-rose-500 text-gray-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-bold">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isAuthenticated}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Share Settings'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
