"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Chip";
import { LeaderboardAd } from "@/components/ads/LeaderboardAd";
import { AD_PLACEMENTS } from "@/components/ads/placements";
import { StateSelectModal } from "@/components/layout/StateSelectModal";
import { useUserState } from "@/context/StatePreferenceContext";
import { getCategoryTheme } from "@/lib/icons";
import type { CategorySeedData } from "../../../prisma/data/categories";
import type { TaskSummary } from "@/lib/queries";
import { Clock, IndianRupee, MapPin, ChevronLeft, ChevronRight, Layers } from "lucide-react";

export interface CategoryPageViewProps {
  category: CategorySeedData;
  tasks: TaskSummary[];
}

export function CategoryPageView({ category, tasks }: CategoryPageViewProps) {
  const { stateData, getTaskLink } = useUserState();
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const theme = getCategoryTheme(category.slug);
  const CategoryIcon = theme.icon;

  const PAGE_SIZE = 24;

  // Filter tasks by difficulty
  const filteredTasks = useMemo(() => {
    if (difficultyFilter === "all") return tasks;
    return tasks.filter((t) => t.difficulty === difficultyFilter);
  }, [tasks, difficultyFilter]);

  // Pagination only if more than 24 tasks
  const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);
  const paginatedTasks = useMemo(() => {
    if (filteredTasks.length <= PAGE_SIZE) return filteredTasks;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [filteredTasks, currentPage, PAGE_SIZE]);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/#browse-by-category-heading" },
    { name: category.name },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* 2. Category Header */}
      <div className="rounded-card border-border to-surface-alt/70 mb-8 border bg-gradient-to-br from-white via-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.bgColor} ${theme.textColor}`}
              aria-hidden="true"
            >
              <CategoryIcon className="h-7 w-7" />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-muted text-xs font-bold tracking-wider uppercase">
                  Civic Category
                </span>
                <span className="bg-border h-1 w-1 rounded-full" />
                <span className="text-muted text-xs font-medium">
                  {tasks.length} {tasks.length === 1 ? "Guide" : "Guides"}
                </span>
              </div>
              <h1 className="text-h1 text-text font-bold tracking-tight">{category.name}</h1>
              <p className="text-body text-muted mt-2 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          {/* State Selector Prompt */}
          <div className="rounded-card border-border bg-background shadow-soft-xs flex shrink-0 flex-col border p-4 sm:min-w-[220px]">
            <span className="text-muted text-[11px] font-semibold tracking-wider uppercase">
              Viewing For State
            </span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-text truncate text-sm font-bold">
                {stateData?.name || "Gujarat"}
              </span>
              <button
                type="button"
                onClick={() => setStateModalOpen(true)}
                className="rounded-input text-primary hover:text-primary-hover hover:bg-primary-soft/40 flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Change</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Chips Bar */}
      <div className="border-border/80 mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted text-xs font-semibold">Filter by difficulty:</span>
          <Chip
            size="sm"
            selected={difficultyFilter === "all"}
            onClick={() => {
              setDifficultyFilter("all");
              setCurrentPage(1);
            }}
          >
            All ({tasks.length})
          </Chip>
          <Chip
            size="sm"
            selected={difficultyFilter === "easy"}
            onClick={() => {
              setDifficultyFilter("easy");
              setCurrentPage(1);
            }}
          >
            Easy (Single Visit)
          </Chip>
          <Chip
            size="sm"
            selected={difficultyFilter === "medium"}
            onClick={() => {
              setDifficultyFilter("medium");
              setCurrentPage(1);
            }}
          >
            Moderate (Test / Verification)
          </Chip>
          <Chip
            size="sm"
            selected={difficultyFilter === "hard"}
            onClick={() => {
              setDifficultyFilter("hard");
              setCurrentPage(1);
            }}
          >
            Multi-step
          </Chip>
        </div>

        <span className="text-muted text-xs font-medium">
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? "guide" : "guides"}
        </span>
      </div>

      {/* 4. Task Cards Grid with Ad Slot after the 3rd Card */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-card border-border bg-surface-alt/40 my-8 border p-12 text-center">
          <Layers className="text-muted mx-auto h-10 w-10 opacity-50" aria-hidden="true" />
          <h3 className="text-body text-text mt-3 font-bold">No guides found in this filter</h3>
          <p className="text-small text-muted mt-1">
            Try switching difficulty filters or reset to view all guides.
          </p>
          <button
            type="button"
            onClick={() => setDifficultyFilter("all")}
            className="rounded-input bg-primary hover:bg-primary-hover mt-4 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedTasks.map((task, index) => {
            const taskHref = getTaskLink(task.slug, task.availableStates);

            return (
              <React.Fragment key={task.slug}>
                {/* Task Card */}
                <Link
                  href={taskHref}
                  className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all focus-visible:ring-3 focus-visible:outline-none"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}
                      >
                        {category.name}
                      </span>

                      <span className="text-muted text-[11px] font-medium capitalize">
                        {task.difficulty}
                      </span>
                    </div>

                    <h3 className="text-body text-text group-hover:text-primary font-bold transition-colors">
                      {task.name}
                    </h3>

                    <p className="text-small text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <span className="text-muted flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{task.estimatedTime}</span>
                    </span>

                    <span className="text-text flex items-center gap-1 font-bold">
                      <IndianRupee className="text-success h-3.5 w-3.5" aria-hidden="true" />
                      <span>{task.cost}</span>
                    </span>
                  </div>
                </Link>

                {/* Prompt 86: CATEGORY_LIST mid-feed ad slot */}
                {index === 2 && (
                  <div className="my-2 w-full sm:col-span-2 lg:col-span-3">
                    <LeaderboardAd slotId={AD_PLACEMENTS.CATEGORY_LIST.slotId} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* 5. Pagination: only if more than 24 tasks */}
      {totalPages > 1 && (
        <nav
          aria-label="Category pagination"
          className="border-border mt-10 flex items-center justify-between border-t pt-6"
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-input border-border text-text hover:bg-surface-alt inline-flex items-center gap-1.5 border bg-white px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Previous</span>
          </button>

          <span className="text-muted text-xs font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-input border-border text-text hover:bg-surface-alt inline-flex items-center gap-1.5 border bg-white px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}

      {/* State Selection Modal */}
      <StateSelectModal isOpen={stateModalOpen} onClose={() => setStateModalOpen(false)} />
    </div>
  );
}
