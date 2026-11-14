"use client";

import React from "react";
import Link from "next/link";
import { Clock, IndianRupee } from "lucide-react";
import type { TaskSummary } from "@/lib/queries";
import { getCategoryTheme } from "@/lib/icons";
import { useUserState } from "@/context/StatePreferenceContext";

export interface PopularTasksProps {
  tasks: TaskSummary[];
}

/**
 * "Most searched guides" section displaying 8 popular task cards
 * with category chip, time needed, and statutory cost.
 * Task links dynamically route to the user's selected state variant.
 */
export function PopularTasks({ tasks }: PopularTasksProps) {
  const { getTaskLink } = useUserState();

  return (
    <section aria-labelledby="most-searched-heading" className="my-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="most-searched-heading" className="text-h2 text-text font-bold tracking-tight">
            Most searched guides
          </h2>
          <p className="text-small text-muted mt-1">
            Official checklists, fees, and requirements for the most requested citizen services.
          </p>
        </div>
        <Link
          href="/guides"
          className="text-small text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1 font-semibold transition-colors sm:mt-0"
        >
          <span>View all guides</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tasks.map((task) => {
          const theme = getCategoryTheme(task.categorySlug);
          const taskHref = getTaskLink(task.slug, task.availableStates);

          return (
            <Link
              key={task.slug}
              href={taskHref}
              className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/40 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all duration-150 focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <div>
                {/* Category Chip */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}
                  >
                    {task.categoryName}
                  </span>
                </div>

                {/* Task Name */}
                <h3 className="text-body text-text group-hover:text-primary font-bold transition-colors">
                  {task.name}
                </h3>

                {/* Brief description */}
                <p className="text-small text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Meta: Time and Cost */}
              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                {/* Time */}
                <div
                  className="text-muted flex items-center gap-1 font-medium"
                  title="Estimated processing time"
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{task.estimatedTime}</span>
                </div>

                {/* Cost */}
                <div
                  className="text-text flex items-center gap-1 font-semibold"
                  title="Official statutory fees"
                >
                  <IndianRupee className="text-success h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{task.cost}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
