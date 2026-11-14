"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import {
  type ConsentPreferences,
  acceptAllConsent,
  rejectNonEssentialConsent,
  saveConsent,
  subscribeToConsent,
  getConsentSnapshot,
  getConsentServerSnapshot,
} from "@/lib/consent";

interface ConsentContextType {
  consent: ConsentPreferences | null;
  isBannerVisible: boolean;
  isManagerOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustom: (prefs: { analytics: boolean; advertising: boolean }) => void;
  openConsentManager: () => void;
  closeConsentManager: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  const isBannerVisible = !userDismissed && (consent === null || isManagerOpen);

  const acceptAll = useCallback(() => {
    acceptAllConsent();
    setIsManagerOpen(false);
    setUserDismissed(true);
  }, []);

  const rejectNonEssential = useCallback(() => {
    rejectNonEssentialConsent();
    setIsManagerOpen(false);
    setUserDismissed(true);
  }, []);

  const saveCustom = useCallback((prefs: { analytics: boolean; advertising: boolean }) => {
    saveConsent({
      analytics: prefs.analytics,
      advertising: prefs.advertising,
      status: "custom",
    });
    setIsManagerOpen(false);
    setUserDismissed(true);
  }, []);

  const openConsentManager = useCallback(() => {
    setIsManagerOpen(true);
    setUserDismissed(false);
  }, []);

  const closeConsentManager = useCallback(() => {
    setIsManagerOpen(false);
    if (consent) {
      setUserDismissed(true);
    }
  }, [consent]);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        isBannerVisible,
        isManagerOpen,
        acceptAll,
        rejectNonEssential,
        saveCustom,
        openConsentManager,
        closeConsentManager,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextType {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}
