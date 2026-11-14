import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-surface-alt animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

export function SkeletonText({ lines = 3, className, lineClassName }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        // Natural varying widths for text lines
        const widthClass =
          index === 0
            ? "w-full"
            : index === lines - 1
              ? "w-3/5"
              : index % 2 === 0
                ? "w-4/5"
                : "w-11/12";

        return <Skeleton key={index} className={cn("h-4 rounded", widthClass, lineClassName)} />;
      })}
    </div>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-card border-border shadow-soft-sm space-y-4 border bg-white p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="rounded-chip h-6 w-24" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="rounded-chip h-8 w-20" />
        <Skeleton className="rounded-chip h-8 w-24" />
      </div>
    </div>
  );
}
