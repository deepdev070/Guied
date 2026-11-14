"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  getClientSelectedState,
  setClientSelectedState,
  getStateBySlugOrCode,
  getTaskUrl,
  DEFAULT_STATE_SLUG,
} from "@/lib/state-preference";
import type { StateSeedData } from "../../prisma/data/states";

export interface StatePreferenceContextType {
  selectedState: string;
  stateData: StateSeedData | undefined;
  setSelectedState: (slug: string) => void;
  getTaskLink: (taskSlug: string, availableStates?: string[]) => string;
}

const StatePreferenceContext = createContext<StatePreferenceContextType | undefined>(undefined);

export function StatePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [selectedState, setSelectedStateInternal] = useState<string>(() =>
    getClientSelectedState()
  );

  useEffect(() => {
    // Listen to changes across components or custom events
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ stateSlug: string }>;
      if (customEvent.detail?.stateSlug) {
        setSelectedStateInternal(customEvent.detail.stateSlug);
      }
    };

    window.addEventListener("state-preference-changed", handleStateChange);
    return () => {
      window.removeEventListener("state-preference-changed", handleStateChange);
    };
  }, []);

  const setSelectedState = (slug: string) => {
    setClientSelectedState(slug);
    setSelectedStateInternal(slug);
  };

  const stateData = useMemo(() => getStateBySlugOrCode(selectedState), [selectedState]);

  const getTaskLink = (taskSlug: string, availableStates?: string[]) => {
    return getTaskUrl(taskSlug, selectedState, availableStates);
  };

  return (
    <StatePreferenceContext.Provider
      value={{
        selectedState,
        stateData,
        setSelectedState,
        getTaskLink,
      }}
    >
      {children}
    </StatePreferenceContext.Provider>
  );
}

export function useUserState(): StatePreferenceContextType {
  const context = useContext(StatePreferenceContext);
  if (!context) {
    // Graceful fallback for components used outside the provider
    const state = DEFAULT_STATE_SLUG;
    return {
      selectedState: state,
      stateData: getStateBySlugOrCode(state),
      setSelectedState: () => {},
      getTaskLink: (taskSlug: string, availableStates?: string[]) =>
        getTaskUrl(taskSlug, state, availableStates),
    };
  }
  return context;
}
