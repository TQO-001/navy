// src/app/(app)/profile/loading.tsx
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#05070a]">
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-1">
          <div className="h-5 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-3 w-64 rounded bg-white/[0.03] animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Identity card */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-56 rounded bg-white/[0.03] animate-pulse" />
            <div className="h-3 w-48 rounded bg-white/[0.03] animate-pulse" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 w-10 rounded bg-white/5 animate-pulse" />
                  <div className="h-2 w-24 rounded bg-white/[0.03] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse" />
                <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/[0.03] animate-pulse" />
                <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}