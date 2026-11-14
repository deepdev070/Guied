import React from "react";
import Link from "next/link";
import { Clock, IndianRupee, ArrowRight, TrendingUp } from "lucide-react";
import type { TaskSummary } from "@/lib/queries";
import { getCategoryTheme } from "@/lib/icons";

export interface PopularInStateBlockProps {
  stateSlug?: string;
  stateName?: string;
  tasks: TaskSummary[];
  className?: string;
}

/**
 * Prompt 79: "Popular in <State>" block on every guide page.
 * Surfaced to citizens based on their state context to build high-authority
 * local internal links and guide citizens to related civic services.
 */
export function PopularInStateBlock({
  stateSlug = "gujarat",
  stateName = "Gujarat",
  tasks,
  className = "",
}: PopularInStateBlockProps) {
  if (!tasks || tasks.length === 0) return null;

  // Take top 3-4 tasks
  const displayTasks = tasks.slice(0, 4);

  return (
    <section
      aria-labelledby="popular-state-heading"
      className={`rounded-card border-border bg-surface shadow-soft-xs my-12 border p-6 md:p-8 ${className}`}
    >
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <div className="text-accent mb-1.5 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span>High Citizen Demand</span>
          </div>
          <h2 id="popular-state-heading" className="text-h3 text-text font-bold tracking-tight">
            Popular in {stateName}
          </h2>
          <p className="text-small text-muted mt-0.5">
            Most requested verified checklists and official fee schedules for citizens in{" "}
            {stateName}:
          </p>
        </div>

        <Link
          href={`/state/${stateSlug}`}
          className="text-primary hover:text-primary-hover focus-visible:ring-primary/40 inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span>All {stateName} guides</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayTasks.map((task) => {
          const theme = getCategoryTheme(task.categorySlug);
          const taskUrl = stateSlug ? `/${task.slug}/${stateSlug}` : `/${task.slug}`;

          return (
            <Link
              key={task.slug}
              href={taskUrl}
              className="rounded-input border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-4 transition-all focus-visible:ring-3 focus-visible:outline-none"
            >
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}
                >
                  {task.categoryName}
                </span>

                <h3 className="text-body text-text group-hover:text-primary mt-2 leading-snug font-bold transition-colors">
                  {task.name}
                </h3>
              </div>

              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
                <span className="text-muted flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{task.estimatedTime}</span>
                </span>
                <span className="text-text flex items-center gap-1 font-semibold">
                  <IndianRupee className="text-success h-3.5 w-3.5" aria-hidden="true" />
                  <span>{task.cost}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
