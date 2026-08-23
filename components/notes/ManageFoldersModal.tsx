'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Folder, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

interface ManageFoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageFoldersModal({ isOpen, onClose }: ManageFoldersModalProps) {
  const { folders, notes, createFolder, renameFolder, deleteFolder } = useNotesStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
  };

  const handleStartRename = (folder: string) => {
    setEditingFolder(folder);
    setEditNameInput(folder);
  };

  const handleConfirmRename = async (oldFolder: string) => {
    if (editNameInput.trim() && editNameInput.trim() !== oldFolder) {
      await renameFolder(oldFolder, editNameInput.trim());
    }
    setEditingFolder(null);
  };

  const handleDelete = async (folder: string) => {
    if (folder === 'General') {
      alert('The General folder cannot be deleted.');
      return;
    }
    if (confirm(`Delete folder "${folder}"? Notes inside will be moved to "General".`)) {
      await deleteFolder(folder, 'General');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Folders" maxWidth="md">
      <div className="space-y-5">
        {/* Create Folder Input */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 text-xs"
          />
          <Button type="submit" className="px-4 text-xs font-bold flex items-center gap-1.5 bg-orbit-blue hover:bg-orbit-blue-hover text-white shrink-0">
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </Button>
        </form>

        {/* Existing Folders List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Your Folders ({folders.length})
          </span>

          {folders.map((folder) => {
            const noteCount = notes.filter((n) => n.folder === folder).length;
            const isEditing = editingFolder === folder;

            return (
              <div
                key={folder}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editNameInput}
                        onChange={(e) => setEditNameInput(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-xl bg-white dark:bg-gray-900 border border-amber-300 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmRename(folder)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFolder(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {folder}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                        {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartRename(folder)}
                      className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      title="Rename Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {folder !== 'General' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(folder)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-bold">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
