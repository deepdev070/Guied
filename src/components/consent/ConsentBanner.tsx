"use client";

import React, { useState } from "react";
import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Cookie, Settings, Check, X } from "lucide-react";
import Link from "next/link";
import type { ConsentPreferences } from "@/lib/consent";

interface ConsentManagerProps {
  initialConsent: ConsentPreferences | null;
  onSave: (prefs: { analytics: boolean; advertising: boolean }) => void;
  onRejectAll: () => void;
  onAcceptAll: () => void;
  onClose?: () => void;
}

function ConsentManagerView({
  initialConsent,
  onSave,
  onRejectAll,
  onAcceptAll,
  onClose,
}: ConsentManagerProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    initialConsent ? initialConsent.analytics : false
  );
  const [advertisingEnabled, setAdvertisingEnabled] = useState(
    initialConsent ? initialConsent.advertising : false
  );

  return (
    <div className="space-y-5">
      <div className="border-border/80 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-5 w-5" aria-hidden="true" />
          <h2 className="text-body text-text font-bold">Manage Consent Preferences</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-surface-alt hover:text-text rounded-lg p-1 transition-colors"
            aria-label="Close preferences"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Essential Tier */}
        <div className="border-border bg-surface-alt/60 rounded-xl border p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-text font-bold">1. Essential Local Storage</span>
            <span className="bg-success-soft text-success rounded-full px-2 py-0.5 text-[11px] font-semibold">
              Always active
            </span>
          </div>
          <p className="text-muted mt-1 leading-relaxed">
            Required to save ticked document checklist items, selected state (e.g. Gujarat), and
            theme tokens on your device. Zero tracking cookies.
          </p>
        </div>

        {/* Analytics Tier */}
        <div className="border-border bg-surface-alt/40 rounded-xl border p-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-text font-bold">2. Privacy-First Analytics</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="bg-border peer-checked:bg-primary peer-focus-visible:ring-primary/40 h-5 w-9 rounded-full peer-focus-visible:ring-2 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          <p className="text-muted mt-1 leading-relaxed">
            Anonymous visitor counts (
            <Link href="/privacy-policy" className="underline">
              Plausible
            </Link>
            ) to find out which guides need updating and fix broken portal links. No personal data.
          </p>
        </div>

        {/* Advertising Tier */}
        <div className="border-border bg-surface-alt/40 rounded-xl border p-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-text font-bold">3. Non-Intrusive Advertisements</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={advertisingEnabled}
                onChange={(e) => setAdvertisingEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="bg-border peer-checked:bg-primary peer-focus-visible:ring-primary/40 h-5 w-9 rounded-full peer-focus-visible:ring-2 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          <p className="text-muted mt-1 leading-relaxed">
            Labeled banner spaces from ethical partners that support keeping all citizen paperwork
            checklists 100% free.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-border/80 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="md"
          onClick={onRejectAll}
          className="text-muted hover:text-text text-xs"
        >
          Reject all
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              onSave({
                analytics: analyticsEnabled,
                advertising: advertisingEnabled,
              })
            }
            className="text-xs"
          >
            <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            <span>Save choices</span>
          </Button>
          <Button variant="primary" size="md" onClick={onAcceptAll} className="text-xs">
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConsentBanner() {
  const {
    consent,
    isBannerVisible,
    isManagerOpen,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    openConsentManager,
    closeConsentManager,
  } = useConsent();

  if (!isBannerVisible) return null;

  return (
    <aside
      aria-label="Privacy and Cookie Consent"
      role="dialog"
      aria-modal="true"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-lg print:hidden"
    >
      <div className="border-border shadow-soft-2xl rounded-2xl border bg-white p-5 ring-1 ring-black/5 sm:p-6">
        {!isManagerOpen ? (
          /* Simple View: Summary + 3 Actions */
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-body text-text font-bold">Your Privacy Choices</h2>
                <p className="text-muted mt-1 text-xs leading-relaxed">
                  We use essential local storage to save your checklist progress and state
                  selection. Optional analytics and ads help fund our verified paperwork research.
                  You can change these anytime in{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:text-primary-hover underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="ghost"
                size="md"
                onClick={openConsentManager}
                className="text-muted hover:text-text text-xs"
              >
                <Settings className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                <span>Manage choices</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={rejectNonEssential}
                className="text-xs"
              >
                Reject non-essential
              </Button>
              <Button variant="primary" size="md" onClick={acceptAll} className="text-xs">
                Accept all
              </Button>
            </div>
          </div>
        ) : (
          <ConsentManagerView
            initialConsent={consent}
            onSave={saveCustom}
            onRejectAll={rejectNonEssential}
            onAcceptAll={acceptAll}
            onClose={consent ? closeConsentManager : undefined}
          />
        )}
      </div>
    </aside>
  );
}
