'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Sparkles, Trophy, AlertCircle, HeartHandshake } from 'lucide-react';

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({ isOpen, onClose }) => {
  const [win, setWin] = useState('');
  const [blocker, setBlocker] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const log = {
      date: todayStr,
      win: win.trim(),
      blocker: blocker.trim(),
      gratitude: gratitude.trim(),
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`orbit_reflection_${todayStr}`, JSON.stringify(log));
    }
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🌙 Daily Evening Reflection">
      <form onSubmit={handleSave} className="space-y-4">
        {savedToast && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
            ✓ Daily Reflection saved successfully!
          </div>
        )}

        <div>
          <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            What was your #1 win or accomplishment today?
          </label>
          <input
            type="text"
            required
            value={win}
            onChange={(e) => setWin(e.target.value)}
            placeholder="e.g. Shipped Next.js quick capture feature"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            What was your biggest friction or distraction?
          </label>
          <input
            type="text"
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            placeholder="e.g. Context switching during morning deep work block"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-purple-500" />
            What are you grateful for today?
          </label>
          <input
            type="text"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="e.g. Productive pair programming session"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-xs font-bold">
            Save Reflection
          </button>
        </div>
      </form>
    </Modal>
  );
};
