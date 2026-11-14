"use client";

import React, { useState } from "react";
import { ListChecks, ArrowUp, RotateCcw, Printer, FileDown, Calendar } from "lucide-react";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { AD_PLACEMENTS } from "@/components/ads/placements";
import { ProgressRing } from "@/components/checklist/ProgressRing";
import { ResetConfirmationModal } from "@/components/checklist/ResetConfirmationModal";
import { CalendarReminderModal } from "./CalendarReminderModal";
import { ShareButtonGroup } from "./ShareButtonGroup";
import { analytics } from "@/lib/analytics";
import type { DocumentRequirement } from "@/types/content";

export interface TaskSidebarProps {
  totalItems: number;
  completedCount: number;
  taskTitle: string;
  taskSlug?: string;
  stateSlug?: string;
  stateName?: string;
  documents?: DocumentRequirement[];
  onResetDocs?: () => void;
}

export function TaskSidebar({
  totalItems,
  completedCount,
  taskTitle,
  taskSlug,
  stateSlug,
  stateName,
  documents = [],
  onResetDocs,
}: TaskSidebarProps) {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const isComplete = completedCount === totalItems && totalItems > 0;

  const scrollToDocs = () => {
    const el = document.getElementById("documents");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Desktop Sticky Sidebar */}
      <aside
        aria-label={`Checklist progress for ${taskTitle}`}
        className="sticky top-24 hidden w-full flex-col gap-4 lg:flex print:hidden"
      >
        {/* Progress Card */}
        <div className="rounded-card border-border bg-background shadow-soft-xs border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-body text-text font-bold">Checklist Progress</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isComplete ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
              }`}
            >
              {isComplete ? "100% Ready" : `${completedCount}/${totalItems}`}
            </span>
          </div>

          {/* Progress Ring with Stats beside it */}
          <div className="border-border/60 flex items-center gap-4 border-y py-2">
            <ProgressRing value={completedCount} max={totalItems} size={58} strokeWidth={5} />
            <div className="flex flex-col">
              <span className="text-text text-sm font-bold">
                {completedCount} of {totalItems} Ready
              </span>
              <span className="text-muted text-xs">
                {isComplete
                  ? "All required papers gathered"
                  : `${totalItems - completedCount} more document${totalItems - completedCount === 1 ? "" : "s"} needed`}
              </span>
            </div>
          </div>

          <p className="text-muted mt-3 text-xs leading-relaxed">
            {isComplete
              ? "🎉 Excellent! All documents are ready for your application."
              : "Check off each document as you place originals and photocopies in your folder."}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToDocs}
                className="rounded-input border-border bg-surface-alt/70 hover:bg-surface-alt hover:border-primary/40 text-text flex flex-1 cursor-pointer items-center justify-center gap-2 border py-2.5 text-xs font-semibold transition-colors"
              >
                <ListChecks className="text-primary h-4 w-4" aria-hidden="true" />
                <span>Jump to Documents</span>
              </button>

              {completedCount > 0 && onResetDocs && (
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  title="Reset checklist"
                  aria-label="Reset checklist"
                  className="rounded-input border-border/80 hover:border-danger/40 hover:bg-danger-soft hover:text-danger text-muted flex h-[38px] w-[38px] cursor-pointer items-center justify-center border transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="rounded-input border-border/80 bg-background hover:bg-surface-alt hover:border-primary/40 text-text flex w-full cursor-pointer items-center justify-center gap-2 border py-2 text-xs font-semibold transition-colors"
            >
              <Printer className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>Print Checklist (A4)</span>
            </button>

            <a
              href={`/api/pdf/${taskSlug || "driving-licence-learner"}${stateSlug ? `?state=${stateSlug}` : ""}`}
              download
              onClick={() =>
                analytics.pdfDownload(taskSlug || "driving-licence-learner", stateSlug)
              }
              className="rounded-input border-border/80 bg-background hover:bg-surface-alt hover:border-primary/40 text-text flex w-full cursor-pointer items-center justify-center gap-2 border py-2 text-xs font-semibold transition-colors"
            >
              <FileDown className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>Download PDF Checklist</span>
            </a>

            <button
              type="button"
              onClick={() => setReminderModalOpen(true)}
              className="rounded-input border-border/80 bg-background hover:bg-surface-alt hover:border-primary/40 text-text flex w-full cursor-pointer items-center justify-center gap-2 border py-2 text-xs font-semibold transition-colors"
            >
              <Calendar className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Appointment Reminder</span>
            </button>
          </div>
        </div>

        {/* Share Button Group (WhatsApp, Telegram, Web Share, Copy Link) */}
        <ShareButtonGroup
          taskTitle={taskTitle}
          stateName={stateName}
          canonicalPath={taskSlug ? `/${taskSlug}${stateSlug ? `/${stateSlug}` : ""}` : undefined}
        />

        {/* Prompt 86: TASK_SIDEBAR_STICKY 300x250 Medium Rectangle Ad Slot (Desktop Only) */}
        <SidebarAd slotId={AD_PLACEMENTS.TASK_SIDEBAR_STICKY.slotId} className="hidden lg:flex" />
      </aside>

      {/* 2. Mobile Floating Sticky Bottom Button / Sheet Trigger */}
      <div className="border-border shadow-soft-xl fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur-md lg:hidden print:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ProgressRing value={completedCount} max={totalItems} size={36} strokeWidth={3.5} />
            <div className="flex flex-col">
              <span className="text-text text-xs font-bold">
                {completedCount}/{totalItems} Ready
              </span>
              <div className="bg-surface-alt mt-1 h-1.5 w-24 overflow-hidden rounded-full">
                <div
                  className="bg-success h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToDocs}
            className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex h-10 cursor-pointer items-center gap-1.5 px-4 text-xs font-bold text-white transition-all active:scale-98"
          >
            <span>View Checklist</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={() => {
          if (onResetDocs) {
            onResetDocs();
          }
        }}
        completedCount={completedCount}
      />

      {/* Calendar Appointment Reminder Modal */}
      <CalendarReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        taskTitle={taskTitle}
        stateName={stateName}
        documents={documents}
        canonicalUrl={
          taskSlug
            ? `https://indiapaperworkguide.in/${taskSlug}${stateSlug ? `/${stateSlug}` : ""}`
            : undefined
        }
      />
    </>
  );
}
