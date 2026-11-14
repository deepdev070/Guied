import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted/40">/</span>
        <Skeleton className="h-4 w-28" />
        <span className="text-muted/40">/</span>
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-3/4 rounded-lg sm:h-12" />
        <Skeleton className="h-5 w-1/2 rounded" />
      </div>

      {/* Summary Box Skeleton */}
      <div className="rounded-card border-border shadow-soft-sm mb-10 space-y-4 border bg-white p-6">
        <Skeleton className="h-6 w-48 rounded" />
        <SkeletonText lines={3} />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Grid of Card Skeletons */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
