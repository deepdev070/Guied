import React from "react";
import Link from "next/link";
import { Clock, IndianRupee } from "lucide-react";
import type { TaskSummary } from "@/lib/queries";
import { getCategoryTheme } from "@/lib/icons";

export interface RelatedTasksProps {
  tasks: TaskSummary[];
}

export function RelatedTasks({ tasks }: RelatedTasksProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <section
      aria-labelledby="related-guides-heading"
      className="border-border my-14 border-t pt-10"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 id="related-guides-heading" className="text-h2 text-text font-bold tracking-tight">
            Related Paperwork Guides
          </h2>
          <p className="text-small text-muted mt-1">
            Other common citizen services in this category.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const theme = getCategoryTheme(task.categorySlug);

          return (
            <Link
              key={task.slug}
              href={`/${task.slug}`}
              className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all focus-visible:ring-3 focus-visible:outline-none"
            >
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}
                >
                  {task.categoryName}
                </span>

                <h3 className="text-body text-text group-hover:text-primary mt-2.5 font-bold transition-colors">
                  {task.name}
                </h3>

                <p className="text-small text-muted mt-1 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
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
