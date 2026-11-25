import React from "react";

export const GroupCardSkeleton: React.FC = () => (
  <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="skeleton h-3.5 w-full" />
      <div className="skeleton h-3.5 w-2/3" />
    </div>
    <div className="flex items-center gap-4 pt-3 border-t border-zinc-800/60">
      <div className="skeleton h-3.5 w-20" />
      <div className="skeleton h-3.5 w-16" />
    </div>
  </div>
);

export const MediaCardSkeleton: React.FC = () => (
  <div className="bg-[#111113] border border-zinc-800/80 rounded-xl overflow-hidden">
    <div className="aspect-[2/3] skeleton rounded-none" />
    <div className="p-3.5 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  </div>
);

export const DetailPageSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 space-y-4">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
      <div className="skeleton h-8 w-64" />
      <div className="skeleton h-4 w-96 max-w-full" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
