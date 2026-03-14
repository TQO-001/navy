// src/app/(app)/documents/loading.tsx
// Next.js 16 automatically wraps this in a Suspense boundary.
// If the documents API route hangs (e.g. slow DB), the user sees this
// instead of a completely blank/frozen page.

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-3 w-48 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-9 w-32 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Section header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-6 rounded-full bg-white/5 animate-pulse" />
        </div>

        {/* Document row skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-white/5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-1/4 rounded bg-white/[0.03] animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}