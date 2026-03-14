// src/app/(app)/calendar/loading.tsx
export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-[#05070a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="h-7 w-28 rounded-lg bg-white/5 animate-pulse mb-2" />
          <div className="h-3 w-56 rounded bg-white/[0.03] animate-pulse" />
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar grid skeleton */}
          <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-5 w-24 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-white/[0.03] animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-9 w-16 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-9 w-9 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 bg-white/[0.02] border-b border-white/5">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="py-3 text-center">
                  <div className="h-2 w-6 rounded bg-white/[0.03] animate-pulse mx-auto" />
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[120px] p-2 border-b border-r border-white/5"
                >
                  <div className="h-4 w-4 rounded bg-white/[0.03] animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:w-80">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-4 rounded bg-white/5 animate-pulse" />
                <div className="h-3 w-28 rounded bg-white/[0.03] animate-pulse" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-28 rounded bg-white/[0.03] animate-pulse" />
                  <div className="h-5 w-20 rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}