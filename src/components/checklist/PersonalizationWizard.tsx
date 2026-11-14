"use client";

import React, { useState, useEffect } from "react";
import { Filter, Check, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface WizardQuestion {
  id: string;
  question: string;
  hint?: string;
  options: {
    label: string;
    description?: string;
    values: Record<string, unknown>;
  }[];
}

export interface PersonalizationWizardProps {
  taskSlug: string;
  totalDocumentsCount: number;
  filteredDocumentsCount: number;
  onApplyAnswers: (answers: Record<string, unknown>) => void;
  onResetAnswers: () => void;
  hasActiveFilters: boolean;
}

function getTaskQuestions(taskSlug: string): WizardQuestion[] {
  if (taskSlug.includes("driving-licence") || taskSlug.includes("licence")) {
    return [
      {
        id: "applicantAge",
        question: "How old is the applicant?",
        hint: "Form 1-A Medical Certificate is required if applicant is 40 years or older.",
        options: [
          {
            label: "Under 40 years (18–39)",
            description: "No mandatory medical fitness form required for private vehicles",
            values: { applicantAge: 25 },
          },
          {
            label: "40 years or older (40+)",
            description: "Form 1-A medical practitioner certificate required",
            values: { applicantAge: 45 },
          },
        ],
      },
      {
        id: "licenceCategory",
        question: "What vehicle category are you applying for?",
        hint: "Commercial transport licences require commercial fitness certification.",
        options: [
          {
            label: "Private Non-Transport (Car / Motorcycle / Scooter)",
            values: { licenceCategory: "non_transport" },
          },
          {
            label: "Commercial / Transport (Taxi / Truck / Bus / Heavy)",
            values: { licenceCategory: "commercial_transport" },
          },
        ],
      },
      {
        id: "trainedAtAccreditedSchool",
        question: "Did you complete training at an Accredited Driver Training Centre (ADTC)?",
        hint: "Recognized ADTC certificate waives RTO physical driving test under CMVR Rule 31B.",
        options: [
          {
            label: "No (Trained independently or normal driving school)",
            values: { trainedAtAccreditedSchool: false },
          },
          {
            label: "Yes (Graduated from state accredited ADTC school)",
            values: { trainedAtAccreditedSchool: true },
          },
        ],
      },
    ];
  }

  if (taskSlug.includes("passport")) {
    return [
      {
        id: "scheme",
        question: "Which application scheme are you applying under?",
        hint: "Tatkaal processing requires Annexure E affidavit and special urgency justification.",
        options: [
          {
            label: "Normal Queue (Standard 10–20 days)",
            values: { scheme: "normal" },
          },
          {
            label: "Tatkaal Queue (Fast-track 3–5 days)",
            values: { scheme: "tatkaal" },
          },
        ],
      },
      {
        id: "addressChanged",
        question: "Has your residential address changed since your last passport?",
        hint: "If address is identical to old passport, fresh address proof is often waived.",
        options: [
          {
            label: "No (Same address as printed in current passport)",
            values: { addressChanged: false },
          },
          {
            label: "Yes (Moved to a new present residential address)",
            values: { addressChanged: true },
          },
        ],
      },
      {
        id: "nonEcrEligible",
        question: "Are you eligible for Non-ECR (Emigration Check Not Required) category?",
        hint: "Passing Class 10 (Matriculation) or holding a diploma/degree qualifies you.",
        options: [
          {
            label: "Yes (Passed Class 10 or higher educational qualification)",
            values: { nonEcrEligible: true },
          },
          {
            label: "No (Below 10th standard educational qualification)",
            values: { nonEcrEligible: false },
          },
        ],
      },
      {
        id: "addSpouse",
        question: "Are you adding or endorsing your spouse's name for the first time?",
        hint: "Requires marriage certificate or joint self-declaration.",
        options: [
          {
            label: "No (Already endorsed or not applicable)",
            values: { addSpouse: false },
          },
          {
            label: "Yes (Newly married / adding spouse name)",
            values: { addSpouse: true },
          },
        ],
      },
    ];
  }

  // Generic fallback questions
  return [
    {
      id: "applicantAge",
      question: "Are you applying for yourself or a minor child?",
      options: [
        {
          label: "Applying for an adult (18+)",
          values: { isMinor: false, applicantAge: 30 },
        },
        {
          label: "Applying for a minor (Under 18)",
          values: { isMinor: true, applicantAge: 12 },
        },
      ],
    },
    {
      id: "addressChanged",
      question: "Do you live at your Aadhaar address?",
      options: [
        {
          label: "Yes (Permanent residence matches Aadhaar)",
          values: { atAadhaarAddress: true, addressChanged: false },
        },
        {
          label: "No (Living at temporary or rented residence)",
          values: { atAadhaarAddress: false, addressChanged: true },
        },
      ],
    },
  ];
}

const STORAGE_PREFIX = "wizard_answers_";

export function PersonalizationWizard({
  taskSlug,
  totalDocumentsCount,
  filteredDocumentsCount,
  onApplyAnswers,
  onResetAnswers,
  hasActiveFilters,
}: PersonalizationWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const questions = getTaskQuestions(taskSlug);

  // Selected option index per question
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${taskSlug}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {};
  });

  // Apply saved answers on initial mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${taskSlug}`);
      if (saved) {
        const parsedIndices = JSON.parse(saved);
        if (typeof parsedIndices === "object" && parsedIndices !== null) {
          const mergedAnswers: Record<string, unknown> = {};
          for (const [qId, optIdx] of Object.entries(parsedIndices)) {
            const q = questions.find((item) => item.id === qId);
            const opt = q?.options[optIdx as number];
            if (opt) {
              Object.assign(mergedAnswers, opt.values);
            }
          }
          if (Object.keys(mergedAnswers).length > 0) {
            onApplyAnswers(mergedAnswers);
          }
        }
      }
    } catch {
      // Ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskSlug]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const nextIndices = {
      ...selectedOptionIndices,
      [questionId]: optionIndex,
    };
    setSelectedOptionIndices(nextIndices);

    // Compute merged answers
    const mergedAnswers: Record<string, unknown> = {};
    for (const [qId, optIdx] of Object.entries(nextIndices)) {
      const q = questions.find((item) => item.id === qId);
      const opt = q?.options[optIdx];
      if (opt) {
        Object.assign(mergedAnswers, opt.values);
      }
    }

    // Save to localStorage
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${taskSlug}`, JSON.stringify(nextIndices));
    } catch {
      // Ignore
    }

    onApplyAnswers(mergedAnswers);
  };

  const handleReset = () => {
    setSelectedOptionIndices({});
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${taskSlug}`);
    } catch {
      // Ignore
    }
    onResetAnswers();
  };

  return (
    <div className="rounded-card border-border shadow-soft-sm mb-6 overflow-hidden border bg-white">
      {/* Accordion / Header Bar */}
      <div className="border-border/70 bg-surface/50 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary-soft text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Filter className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-text text-sm font-bold sm:text-base">
                Personalise your checklist
              </h3>
              {hasActiveFilters && (
                <Badge variant="verified">
                  Filtered ({filteredDocumentsCount} of {totalDocumentsCount} documents)
                </Badge>
              )}
            </div>
            <p className="text-muted mt-0.5 text-xs">
              Answer 3 quick questions to hide irrelevant affidavits and medical forms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-muted hover:text-danger flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset to Full List</span>
            </button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-primary hover:bg-primary-soft h-9 px-3 text-xs font-semibold"
            aria-expanded={isOpen}
          >
            <span>{isOpen ? "Hide Questionnaire" : "Open Questionnaire"}</span>
            {isOpen ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Personalised Banner if collapsed but active */}
      {!isOpen && hasActiveFilters && (
        <div className="bg-success-soft/60 text-success border-success/20 flex items-center justify-between border-b px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 font-bold" />
            <span>
              Your personalised list is active: showing <strong>{filteredDocumentsCount}</strong>{" "}
              documents tailored to your situation.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hover:text-success/80 font-semibold underline"
          >
            Edit answers
          </button>
        </div>
      )}

      {/* Question Cards (when opened) */}
      {isOpen && (
        <div className="space-y-6 p-4 sm:p-6">
          <p className="text-muted text-xs leading-relaxed">
            All answers are stored locally on your device. We do not require any login, phone
            number, or personal identifiers.
          </p>

          <div className="space-y-5">
            {questions.map((q, qIndex) => {
              const selectedIdx = selectedOptionIndices[q.id];

              return (
                <div
                  key={q.id}
                  className="border-border/80 bg-surface/30 rounded-lg border p-3.5 sm:p-4"
                >
                  <div className="mb-2">
                    <span className="text-primary text-[11px] font-bold tracking-wider uppercase">
                      Question {qIndex + 1} of {questions.length}
                    </span>
                    <h4 className="text-text mt-0.5 text-sm font-bold">{q.question}</h4>
                    {q.hint && <p className="text-muted mt-0.5 text-[11px]">{q.hint}</p>}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedIdx === optIndex;

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={cn(
                            "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary-soft/60 text-primary shadow-soft-xs"
                              : "border-border text-text hover:border-primary/40 hover:bg-surface-alt/40 bg-white"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-muted/50 bg-white"
                            )}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="block text-xs leading-snug font-semibold">
                              {opt.label}
                            </span>
                            {opt.description && (
                              <span className="text-muted mt-1 block text-[11px] leading-tight">
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-border/70 flex items-center justify-between border-t pt-4">
            <span className="text-text text-xs font-medium">
              Showing <strong>{filteredDocumentsCount}</strong> of{" "}
              <strong>{totalDocumentsCount}</strong> documents
            </span>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsOpen(false)}
              className="h-9 px-4 text-xs"
            >
              Done &amp; View Checklist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
