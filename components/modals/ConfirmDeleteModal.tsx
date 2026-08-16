'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  message?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  itemName,
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Permanent Delete Warning
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed flex flex-wrap">
              {message}
            </p>
            {itemName && (
              <p className="text-xs font-black text-rose-800 dark:text-rose-200 pt-0.5 flex flex-wrap">
                Item: &quot;{itemName}&quot;
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
