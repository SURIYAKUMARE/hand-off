import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#E4E7EC] rounded ${className}`} />
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 6 }) => (
  <div className="w-full bg-surface border border-border rounded-lg overflow-hidden">
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-[#F7F8FA]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="bg-surface border border-border rounded-lg p-4">
    <Skeleton className="h-3.5 w-24 mb-3" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* KPI cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface border border-border rounded-lg p-5">
        <Skeleton className="h-4 w-36 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="bg-surface border border-border rounded-lg p-5">
        <Skeleton className="h-4 w-36 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
    {/* Workload and activity skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5">
        <Skeleton className="h-4 w-40 mb-4" />
        <TableSkeleton rows={3} cols={4} />
      </div>
      <div className="bg-surface border border-border rounded-lg p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TicketDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-6 w-80" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>

    {/* 2-Column Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
