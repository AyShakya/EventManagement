import React from "react";

function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton-block ${className}`.trim()} aria-hidden="true" />;
}

export default function PageSkeleton({
  title = "Loading content",
  lines = 3,
  cards = 3,
}) {
  return (
    <div className="app-container page-content py-10" role="status" aria-live="polite">
      <div className="surface-card p-6 md:p-8 space-y-5">
        <SkeletonBlock className="h-8 w-52" />
        {Array.from({ length: lines }).map((_, idx) => (
          <SkeletonBlock key={idx} className={`h-4 ${idx === lines - 1 ? "w-2/3" : "w-full"}`} />
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Array.from({ length: cards }).map((_, idx) => (
            <div key={idx} className="space-y-3 rounded-xl border border-coffee-cream/80 p-4">
              <SkeletonBlock className="h-28 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
              <SkeletonBlock className="h-3 w-3/5" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
