import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/Badge';
import { SubjectPlan } from '../../types';
import { useCareerStore } from '../../store/useCareerStore';
import { Share2, Copy, Check, Globe, Lock, Mail, Plus, X, ShieldCheck } from 'lucide-react';

interface ShareSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubjectPlan | null;
}

export function ShareSubjectModal({ isOpen, onClose, plan }: ShareSubjectModalProps) {
  const { updateSubjectPlan } = useCareerStore();

  const [isPublic, setIsPublic] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setIsPublic(Boolean(plan.isPublic));
      setEmails(plan.sharedWithEmails || []);
    }
  }, [plan]);

  if (!plan) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/career/${plan.id}`
    : `/career/${plan.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    setEmailError(null);

    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (emails.includes(email)) {
      setEmailError('This email is already in the access list.');
      return;
    }

    setEmails([...emails, email]);
    setEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleSave = async () => {
    await updateSubjectPlan(plan.id, {
      isPublic,
      sharedWithEmails: emails,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Study Plan">
      <div className="space-y-6">
        {/* Plan Header Info */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
              {plan.title}
            </h4>
            <span className="text-[10px] text-gray-400 block">
              {plan.topics.length} Curriculum Topics • {plan.category}
            </span>
          </div>
          <Badge variant={isPublic ? 'success' : emails.length > 0 ? 'info' : 'secondary'} size="sm">
            {isPublic ? 'Public Link' : emails.length > 0 ? 'Restricted Email Share' : 'Private'}
          </Badge>
        </div>

        {/* Copy Share URL Section */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-orbit-blue" />
            <span>Shareable Link</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200 truncate select-all">
              {shareUrl}
            </div>

            <Button
              type="button"
              variant="default"
              onClick={handleCopy}
              className={`shrink-0 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Public Access Toggle */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPublic
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-gray-900 dark:text-white">
                  Public Link Access
                </h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isPublic
                    ? 'Anyone with the link can view this study plan'
                    : 'Only you and authorized emails can open the link'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Restricted Specific Emails Section */}
        <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div>
            <h5 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>Share with Specific Emails</span>
            </h5>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Grant access exclusively to specified Google / Orbit account email addresses.
            </p>
          </div>

          <form onSubmit={handleAddEmail} className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="e.g. peer@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </form>

          {emailError && (
            <p className="text-[11px] font-bold text-rose-500">{emailError}</p>
          )}

          {/* List of Shared Emails */}
          {emails.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {emails.map((email) => (
                <span
                  key={email}
                  className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-orbit-blue border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold flex items-center gap-2"
                >
                  <Mail className="w-3 h-3 text-indigo-500" />
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="p-0.5 text-indigo-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic">No specific emails added yet.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Changes sync instantly</span>
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="text-xs font-bold">
              Save Sharing Settings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
