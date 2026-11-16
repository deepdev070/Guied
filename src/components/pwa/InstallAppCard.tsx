"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INSTALL_DISMISSAL_KEY,
  DISMISSAL_PERIOD_DAYS,
  isInstallPromptDismissed,
  dismissInstallPrompt,
  resetInstallPromptDismissal,
} from "@/lib/pwa/install-prompt";

export {
  INSTALL_DISMISSAL_KEY,
  DISMISSAL_PERIOD_DAYS,
  isInstallPromptDismissed,
  dismissInstallPrompt,
  resetInstallPromptDismissal,
};

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface InstallAppCardProps {
  forceShow?: boolean;
  className?: string;
  onDismiss?: () => void;
  onInstallSuccess?: () => void;
}

export function InstallAppCard({
  forceShow = false,
  className,
  onDismiss,
  onInstallSuccess,
}: InstallAppCardProps) {
  const [isVisible, setIsVisible] = useState(() => forceShow && !isInstallPromptDismissed());
  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !/crios|fxios/i.test(ua);
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || isInstalled) return;

    // Capture beforeinstallprompt for Android/Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      onInstallSuccess?.();
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for checklist save or completion event
    const handleChecklistSaved = () => {
      if (!isInstallPromptDismissed()) {
        setIsVisible(true);
      }
    };

    window.addEventListener("civic-checklist-saved", handleChecklistSaved);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("civic-checklist-saved", handleChecklistSaved);
    };
  }, [isInstalled, onInstallSuccess]);

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
    onDismiss?.();
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsVisible(false);
          onInstallSuccess?.();
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("[PWA] Installation prompt failed:", err);
      }
    }
  };

  // If dismissed, already installed, or not triggered to show
  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Install App Recommendation"
      className={cn(
        "border-primary/20 shadow-soft-sm text-text relative rounded-xl border bg-white p-4 transition-all sm:p-5",
        className
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install app recommendation for 30 days"
        className="text-text-muted hover:text-text hover:bg-surface-subtle focus:ring-primary absolute top-3 right-3 rounded-md p-1.5 transition-colors focus:ring-2 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-start gap-4 pr-6 sm:flex-row sm:items-center sm:pr-8">
        {/* App Icon */}
        <div className="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1 shadow-xs">
          <Image
            src="/icons/icon.svg"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
          />
        </div>

        {/* Text information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-text text-base font-bold">Install India Paperwork Guide</h3>
            <span className="text-primary bg-primary-soft hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline-block">
              Works Offline
            </span>
          </div>
          <p className="text-small text-text-muted mt-1 leading-relaxed">
            {isIos
              ? "Add to your iPhone or iPad home screen for 1-tap offline access to your saved checklists."
              : "Install our lightweight app to view checklists and verify documents anytime, even without internet."}
          </p>

          {/* iOS Safari step instructions */}
          {isIos && (
            <div className="bg-surface-subtle border-border/60 text-small text-text mt-3 rounded-lg border p-3">
              <ol className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Tap the</span>
                  <span className="text-text border-border inline-flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 font-semibold">
                    <Share className="text-primary h-3.5 w-3.5" /> Share
                  </span>
                  <span>button in Safari&apos;s toolbar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Scroll down and select</span>
                  <span className="text-text border-border inline-flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 font-semibold">
                    <PlusSquare className="text-primary h-3.5 w-3.5" /> Add to Home Screen
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-border/50 mt-4 flex flex-wrap items-center justify-end gap-3 border-t pt-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-small text-text-muted hover:text-text hover:bg-surface-subtle focus:ring-primary rounded-lg px-4 py-2 font-medium transition-colors focus:ring-2 focus:outline-none"
        >
          Not now
        </button>

        {!isIos && (
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className={cn(
              "text-small focus:ring-primary inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
              deferredPrompt
                ? "bg-primary hover:bg-primary-hover cursor-pointer"
                : "bg-primary/70 cursor-not-allowed"
            )}
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </button>
        )}

        {isIos && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-small bg-primary hover:bg-primary-hover focus:ring-primary inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Got it
          </button>
        )}
      </div>
    </aside>
  );
}
