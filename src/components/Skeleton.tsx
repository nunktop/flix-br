import React from 'react';
import { cn } from '../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-gray-800 rounded", className)} />
  );
}

export function MovieRowSkeleton() {
  return (
    <div className="mb-8 px-4 md:px-12">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="flex-none w-32 md:w-48 lg:w-56 aspect-video-netflix" />
        ))}
      </div>
    </div>
  );
}
