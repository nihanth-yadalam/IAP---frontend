/**
 * Skeleton — shimmer placeholder cards for loading states.
 */

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

/** TaskCardSkeleton — shimmer placeholder matching the task card layout */
export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/30 p-5 space-y-3 bg-card animate-fade-in">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-1 w-full mt-2" />
    </div>
  )
}

/** DashboardStatSkeleton — shimmer for the stats row */
export function DashboardStatSkeleton() {
  return (
    <div className="rounded-2xl border border-border/30 p-4 bg-card space-y-2 animate-fade-in">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
