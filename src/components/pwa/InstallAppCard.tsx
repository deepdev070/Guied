"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const INSTALL_DISMISSAL_KEY = "civic_install_dismissed_until";
export const DISMISSAL_PERIOD_DAYS = 30;
const THIRTY_DAYS_MS = DISMISSAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(INSTALL_DISMISSAL_KEY);
    if (!raw) return false;
    const expiresAt = parseInt(raw, 10);
    return !isNaN(expiresAt) && Date.now() < expiresAt;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    const expiresAt = Date.now() + THIRTY_DAYS_MS;
    localStorage.setItem(INSTALL_DISMISSAL_KEY, expiresAt.toString());
  } catch {
    // Ignore storage errors
  }
}

export function resetInstallPromptDismissal(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(INSTALL_DISMISSAL_KEY);
  } catch {
    // Ignore storage errors
  }
}

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
  const [isVisible, setIsVisible] = useState(forceShow);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/i.test(ua);
    setIsIos(isIosDevice);

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
      if (!isInstallPromptDismissed() && !isStandalone) {
        setIsVisible(true);
      }
    };

    window.addEventListener("civic-checklist-saved", handleChecklistSaved);

    // If forceShow was requested and not already dismissed or standalone
    if (forceShow && !isInstallPromptDismissed() && !isStandalone) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("civic-checklist-saved", handleChecklistSaved);
    };
  }, [forceShow, onInstallSuccess]);

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
        "relative rounded-xl border border-primary/20 bg-white p-4 sm:p-5 shadow-soft-sm transition-all text-text",
        className
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install app recommendation for 30 days"
        className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6 sm:pr-8">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-xs p-1">
          <Image
            src="/icons/icon.svg"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg"
          />
        </div>

        {/* Text information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-text">Install India Paperwork Guide</h3>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-primary-soft rounded-full">
              Works Offline
            </span>
          </div>
          <p className="mt-1 text-small text-text-muted leading-relaxed">
            {isIos
              ? "Add to your iPhone or iPad home screen for 1-tap offline access to your saved checklists."
              : "Install our lightweight app to view checklists and verify documents anytime, even without internet."}
          </p>

          {/* iOS Safari step instructions */}
          {isIos && (
            <div className="mt-3 bg-surface-subtle rounded-lg p-3 border border-border/60 text-small text-text">
              <ol className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-text bg-white px-1.5 py-0.5 rounded border border-border">
                    <Share className="w-3.5 h-3.5 text-primary" /> Share
                  </span>
                  <span>button in Safari&apos;s toolbar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Scroll down and select</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-text bg-white px-1.5 py-0.5 rounded border border-border">
                    <PlusSquare className="w-3.5 h-3.5 text-primary" /> Add to Home Screen
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-4 py-2 text-small font-medium text-text-muted hover:text-text rounded-lg hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          Not now
        </button>

        {!isIos && (
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2 rounded-lg text-small font-semibold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors",
              deferredPrompt
                ? "bg-primary hover:bg-primary-hover cursor-pointer"
                : "bg-primary/70 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </button>
        )}

        {isIos && (
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-small font-semibold text-white bg-primary hover:bg-primary-hover shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Got it
          </button>
        )}
      </div>
    </aside>
  );
}
