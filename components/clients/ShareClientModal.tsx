'use client';

import React, { useState } from 'react';
import { Project, ProjectSharedUser } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Badge } from '../ui/Badge';
import { Share2, Lock, Copy, Check, Mail, Plus, Trash2, Eye, Edit3, ShieldAlert, UserCheck } from 'lucide-react';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

interface ShareClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateShareSettings: (sharedWith: ProjectSharedUser[]) => Promise<void>;
}

export function ShareClientModal({
  isOpen,
  onClose,
  project,
  onUpdateShareSettings,
}: ShareClientModalProps) {
  const { session } = useGoogleAuth();

  const [sharedUsers, setSharedUsers] = useState<ProjectSharedUser[]>(project.sharedWith || []);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/clients/${project.id}`
    : `/clients/${project.id}`;

  const isAuthenticated = !!session;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    if (!trimmed.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const existingIndex = sharedUsers.findIndex((u) => u.email.toLowerCase() === trimmed);
    if (existingIndex >= 0) {
      // Update existing role
      const updated = [...sharedUsers];
      updated[existingIndex] = { ...updated[existingIndex], role: roleInput };
      setSharedUsers(updated);
    } else {
      // Add new shared user
      setSharedUsers([
        ...sharedUsers,
        { email: trimmed, role: roleInput, addedAt: new Date().toISOString() },
      ]);
    }

    setEmailInput('');
    setErrorMessage(null);
  };

  const handleToggleUserRole = (email: string) => {
    setSharedUsers(
      sharedUsers.map((u) =>
        u.email === email ? { ...u, role: u.role === 'view' ? 'edit' : 'view' } : u
      )
    );
  };

  const handleRemoveUser = (email: string) => {
    setSharedUsers(sharedUsers.filter((u) => u.email !== email));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateShareSettings(sharedUsers);
      onClose();
    } catch (err: any) {
      console.warn('Failed to update share settings', err);
      setErrorMessage(err?.message || 'Failed to update share settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Client Workspace" maxWidth="md">
      <div className="space-y-5">
        {/* Private Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">Private Workspace Link</span>
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              This client workspace is private. Only authorized users listed below will have access when opening the shared link.
            </p>
          </div>
        </div>

        {/* Share Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Workspace Share Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                readOnly
                value={shareUrl}
                className="pr-9 font-mono text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800"
              />
              <Share2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button
              type="button"
              onClick={handleCopyLink}
              variant={copied ? 'secondary' : 'outline'}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
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

        {/* Add / Invite User Form */}
        <form onSubmit={handleAddUser} className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Invite Specific User</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                type="email"
                placeholder="Enter user email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="pl-9"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="w-full sm:w-36">
              <Select
                value={roleInput}
                onValueChange={(val) => setRoleInput(val as 'view' | 'edit')}
                options={[
                  { value: 'view', label: 'View Only' },
                  { value: 'edit', label: 'View & Edit' },
                ]}
              />
            </div>
            <Button type="submit" className="shrink-0 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>
          {errorMessage && <p className="text-xs font-bold text-rose-500">{errorMessage}</p>}
        </form>

        {/* Shared Users List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>People with Access ({sharedUsers.length})</span>
            <span className="text-[10px] text-gray-400 font-normal">Only listed emails can view/edit</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {sharedUsers.length === 0 ? (
              <div className="p-4 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                No specific users invited yet. Add an email above to share.
              </div>
            ) : (
              sharedUsers.map((user) => (
                <div
                  key={user.email}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0 uppercase">
                      {user.email[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-400">
                        Granted {user.role === 'edit' ? 'View & Edit' : 'View Only'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleUserRole(user.email)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        user.role === 'edit'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      {user.role === 'edit' ? (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>View & Edit</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>View Only</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.email)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove user access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>{isSaving ? 'Saving...' : 'Save Share Access'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
