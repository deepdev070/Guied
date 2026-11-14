"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ReportMistakeModal } from "@/components/layout/ReportMistakeModal";

export interface ReportMistakeContextValue {
  isOpen: boolean;
  taskSlug?: string;
  stateCode?: string;
  openReportMistake: (params?: { taskSlug?: string; stateCode?: string }) => void;
  closeReportMistake: () => void;
}

const ReportMistakeContext = createContext<ReportMistakeContextValue | null>(null);

export function ReportMistakeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskSlug, setTaskSlug] = useState<string | undefined>();
  const [stateCode, setStateCode] = useState<string | undefined>();

  const openReportMistake = useCallback((params?: { taskSlug?: string; stateCode?: string }) => {
    setTaskSlug(params?.taskSlug);
    setStateCode(params?.stateCode);
    setIsOpen(true);
  }, []);

  const closeReportMistake = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ReportMistakeContext.Provider
      value={{
        isOpen,
        taskSlug,
        stateCode,
        openReportMistake,
        closeReportMistake,
      }}
    >
      {children}
      <ReportMistakeModal
        isOpen={isOpen}
        onClose={closeReportMistake}
        taskSlug={taskSlug}
        stateCode={stateCode}
      />
    </ReportMistakeContext.Provider>
  );
}

export function useReportMistake(): ReportMistakeContextValue {
  const context = useContext(ReportMistakeContext);
  if (!context) {
    throw new Error("useReportMistake must be used within a ReportMistakeProvider");
  }
  return context;
}
