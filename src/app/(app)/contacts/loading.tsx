// src/app/(app)/contacts/loading.tsx
export default function ContactsLoading() {
  return (
    <div className="min-h-screen bg-[#05070a]">
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-28 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-9 flex-1 max-w-xs rounded-xl bg-white/5 animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Group label */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-5 rounded-full bg-white/5 animate-pulse" />
        </div>

        {/* Contact row skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-white/5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-11 h-11 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-20 rounded-lg bg-white/[0.03] animate-pulse" />
              </div>
              <div className="h-3 w-40 rounded bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}