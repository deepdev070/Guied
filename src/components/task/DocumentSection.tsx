"use client";

import React, { useState } from "react";
import { ChecklistItem } from "@/components/ui/ChecklistItem";
import { ProgressRing } from "@/components/checklist/ProgressRing";
import { ChecklistCompletionBanner } from "@/components/checklist/ChecklistCompletionBanner";
import { ResetConfirmationModal } from "@/components/checklist/ResetConfirmationModal";
import { PersonalizationWizard } from "@/components/checklist/PersonalizationWizard";
import { evaluate, type Rule } from "@/lib/rule-evaluator";
import type { DocumentRequirement } from "@/types/content";
import { RotateCcw, Printer, FileDown, Calendar } from "lucide-react";
import { CalendarReminderModal } from "./CalendarReminderModal";
import { analytics } from "@/lib/analytics";

export interface DocumentSectionProps {
  documents: DocumentRequirement[];
  completedIds: string[];
  onToggleDoc: (id: string) => void;
  onResetDocs?: () => void;
  taskTitle?: string;
  taskSlug?: string;
  stateName?: string;
}

export function DocumentSection({
  documents,
  completedIds,
  onToggleDoc,
  onResetDocs,
  taskTitle = "this application",
  taskSlug = "generic-task",
  stateName,
}: DocumentSectionProps) {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});

  const hasActiveFilters = Object.keys(userAnswers).length > 0;

  // Filter documents using rule evaluator
  const visibleDocuments = React.useMemo(() => {
    if (!hasActiveFilters) return documents;
    return documents.filter((doc) => evaluate(doc.appliesWhen as Rule, userAnswers));
  }, [documents, userAnswers, hasActiveFilters]);

  // Group documents into standard civic categories
  const groupedDocs = React.useMemo(() => {
    const groups: Record<string, DocumentRequirement[]> = {
      "Identity proof": [],
      "Address proof": [],
      "Photos and forms": [],
      "Other documents": [],
    };

    for (const doc of visibleDocuments) {
      const lower = `${doc.name} ${doc.description || ""}`.toLowerCase();
      if (
        lower.includes("identity") ||
        lower.includes("aadhaar") ||
        lower.includes("pan") ||
        lower.includes("passport") ||
        lower.includes("voter")
      ) {
        groups["Identity proof"]!.push(doc);
      } else if (
        lower.includes("address") ||
        lower.includes("utility") ||
        lower.includes("bill") ||
        lower.includes("electricity") ||
        lower.includes("rent")
      ) {
        groups["Address proof"]!.push(doc);
      } else if (
        lower.includes("photo") ||
        lower.includes("form") ||
        lower.includes("signature") ||
        lower.includes("declaration") ||
        lower.includes("affidavit")
      ) {
        groups["Photos and forms"]!.push(doc);
      } else {
        groups["Other documents"]!.push(doc);
      }
    }

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [visibleDocuments]);

  // Calculate readiness against currently visible (or personalised) documents
  const visibleIds = new Set(visibleDocuments.map((d) => d.id || d.name));
  const activeCompletedIds = completedIds.filter((id) => visibleIds.has(id));

  const readyCount = activeCompletedIds.length;
  const totalCount = visibleDocuments.length;
  const isAllReady = readyCount === totalCount && totalCount > 0;

  return (
    <section id="documents" aria-labelledby="documents-heading" className="my-10 scroll-mt-28">
      {/* Section Header with Circular Progress Ring & Interactive Stats */}
      <div className="border-border/80 mb-6 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="documents-heading" className="text-h2 text-text font-bold tracking-tight">
              Required Documents
            </h2>
            {hasActiveFilters && (
              <span className="bg-success-soft text-success border-success/20 rounded-full border px-3 py-1 text-xs font-bold">
                Your personalised list ({totalCount} documents)
              </span>
            )}
          </div>
          <p className="text-small text-muted mt-1">
            Check off each original and photocopy as you gather them in your folder.
          </p>
        </div>

        {/* Progress Ring & Reset Controls */}
        <div className="flex shrink-0 items-center gap-4">
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {readyCount} of {totalCount} documents ready
            {isAllReady ? " — All required documents are gathered!" : ""}
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing value={readyCount} max={totalCount} size={52} strokeWidth={4.5} />
            <div className="flex flex-col">
              <span className="text-text text-sm font-bold">
                {readyCount} of {totalCount} ready
              </span>
              <span className="text-muted text-xs">
                {isAllReady ? "All documents gathered" : `${totalCount - readyCount} remaining`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              aria-label="Print checklist"
              title="Print checklist"
              className="rounded-input border-border/80 hover:border-primary/40 hover:bg-surface-alt text-text flex h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-semibold transition-colors"
            >
              <Printer className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>Print</span>
            </button>

            <a
              href={`/api/pdf/${taskSlug || "driving-licence-learner"}`}
              download
              onClick={() => analytics.pdfDownload(taskSlug, stateName)}
              aria-label="Download PDF checklist"
              title="Download PDF checklist"
              className="rounded-input border-border/80 hover:border-primary/40 hover:bg-surface-alt text-text flex h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-semibold transition-colors"
            >
              <FileDown className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>PDF</span>
            </a>

            <button
              type="button"
              onClick={() => setReminderModalOpen(true)}
              aria-label="Add reminder"
              title="Add appointment reminder"
              className="rounded-input border-border/80 hover:border-primary/40 hover:bg-surface-alt text-text flex h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-semibold transition-colors"
            >
              <Calendar className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>Add reminder</span>
            </button>

            {readyCount > 0 && onResetDocs && (
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                aria-label="Reset checklist progress"
                className="rounded-input border-border/80 hover:border-danger/40 hover:bg-danger-soft hover:text-danger text-muted flex h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confetti-Free Green Completion Banner when all items are ticked */}
      {isAllReady && (
        <div className="mb-6">
          <ChecklistCompletionBanner
            totalCount={totalCount}
            taskTitle={taskTitle}
            onReset={onResetDocs ? () => setResetModalOpen(true) : undefined}
          />
        </div>
      )}

      {/* 3-5 Question Personalisation Wizard Card */}
      <PersonalizationWizard
        taskSlug={taskSlug}
        totalDocumentsCount={documents.length}
        filteredDocumentsCount={visibleDocuments.length}
        onApplyAnswers={(answers) => setUserAnswers(answers)}
        onResetAnswers={() => setUserAnswers({})}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Grouped Checklist Items */}
      <div className="space-y-8">
        {groupedDocs.map(([groupName, items]) => (
          <div key={groupName} className="space-y-3">
            <h3 className="text-body text-text flex items-center gap-2 font-bold tracking-tight">
              <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
              <span>{groupName}</span>
              <span className="text-muted text-xs font-normal">({items.length})</span>
            </h3>

            <div className="space-y-3">
              {items.map((doc) => {
                const docId = doc.id || doc.name;
                const isChecked = completedIds.includes(docId);

                return (
                  <ChecklistItem
                    key={docId}
                    id={`doc-check-${docId}`}
                    name={doc.name}
                    description={doc.description}
                    requirementType={doc.requirementType}
                    copiesHint={doc.copiesHint}
                    specs={doc.specs}
                    checked={isChecked}
                    onChange={() => onToggleDoc(docId)}
                  />
                );
              })}
            </div>
          </div>
        ))}
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
        completedCount={readyCount}
      />

      {/* Calendar Appointment Reminder Modal */}
      <CalendarReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        taskTitle={taskTitle}
        stateName={stateName}
        documents={visibleDocuments}
        canonicalUrl={taskSlug ? `https://indiapaperworkguide.in/${taskSlug}` : undefined}
      />
    </section>
  );
}
