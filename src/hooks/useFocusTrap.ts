"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocus?: boolean;
}

/**
 * Reusable hook that creates a strict, accessible focus trap within a modal, drawer, or dialog.
 * - Saves document.activeElement before opening and restores it on close.
 * - Focuses initial element or the first focusable element inside the container.
 * - Wraps Tab and Shift+Tab navigation cyclically inside the container.
 * - Listens for Escape key to trigger onClose.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  initialFocusRef,
  returnFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the element that triggered the dialog
    if (typeof document !== "undefined") {
      triggerRef.current = document.activeElement as HTMLElement | null;
    }

    const container = containerRef.current;
    if (!container) return;

    // Set initial focus
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0]?.focus();
        } else {
          container.focus();
        }
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onClose) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key === "Tab") {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          // Verify element is visible
          return el.offsetParent !== null || el.getClientRects().length > 0;
        });

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab backwards
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          // Tab forwards
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (returnFocus && triggerRef.current) {
        // Return focus back to trigger button
        const elem = triggerRef.current;
        setTimeout(() => {
          if (typeof elem.focus === "function") {
            elem.focus();
          }
        }, 10);
      }
    };
  }, [isOpen, onClose, initialFocusRef, returnFocus]);

  return containerRef;
}
