'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcutGroups = [
    {
      category: 'Navigation & Focus',
      items: [
        { key: 'D', description: 'Go to Today page' },
        { key: 'F', description: 'Trigger Distraction-Free Focus Mode' },
        { key: '⌘ K / Ctrl K', description: 'Open Global Search & Quick Capture' },
        { key: '?', description: 'Show Keyboard Shortcuts Cheat Sheet' },
      ],
    },
    {
      category: 'Quick Actions',
      items: [
        { key: 'N', description: 'Create New Task' },
        { key: 'Esc', description: 'Close Modals & Focus Overlay' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="md">
      <div className="space-y-5 py-1">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 text-xs">
          <Keyboard className="w-4 h-4 text-orbit-blue shrink-0" />
          <span>Press these keys anytime from any page to navigate quickly.</span>
        </div>

        <div className="space-y-4">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.description}
                    </span>
                    <kbd className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-mono font-bold text-orbit-blue shadow-xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
