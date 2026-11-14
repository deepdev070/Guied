"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  completedCount: number;
}

export function ResetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  completedCount,
}: ResetConfirmationModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="bg-text/40 fixed inset-0 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="rounded-card border-border shadow-soft-xl relative w-full max-w-sm border bg-white p-6 transition-all sm:p-7">
        <div className="bg-danger-soft text-danger mb-4 flex h-11 w-11 items-center justify-center rounded-full">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <h3 id="reset-modal-title" className="text-h3 text-text font-bold">
          Reset Checklist?
        </h3>

        <p className="text-muted mt-2 text-xs leading-relaxed sm:text-sm">
          This will untick all <strong>{completedCount}</strong> documents you have checked off for
          this task and reset your progress to zero. This cannot be undone.
        </p>

        <div className="border-border/70 mt-6 flex items-center justify-end gap-3 border-t pt-4">
          <Button type="button" onClick={onClose} variant="ghost" size="md">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant="danger"
            size="md"
          >
            Yes, Reset All
          </Button>
        </div>
      </div>
    </div>
  );
}
