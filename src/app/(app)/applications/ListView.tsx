"use client"
import { useRouter } from "next/navigation"
import { MapPin, DollarSign, Calendar, Star, Briefcase } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS } from "@/types"

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; color: string }> = {
  wishlist: { bg: "bg-slate-500/10", color: "text-slate-400" },
  applied: { bg: "bg-blue-500/10", color: "text-blue-400" },
  phone_screen: { bg: "bg-amber-500/10", color: "text-amber-400" },
  interview: { bg: "bg-purple-500/10", color: "text-purple-400" },
  offer: { bg: "bg-emerald-500/10", color: "text-emerald-400" },
  rejected: { bg: "bg-red-500/10", color: "text-red-400" },
  withdrawn: { bg: "bg-orange-500/10", color: "text-orange-400" },
  ghosted: { bg: "bg-zinc-500/10", color: "text-zinc-500" },
}

export function ListView({
  apps, selected, setSelected,
}: { apps: Application[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const router = useRouter()

  function toggleOne(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const n = new Set(selected)
    n.has(id) ? n.delete(id) : n.add(id)
    setSelected(n)
  }

  if (!apps.length) return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl m-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">No matching entries</p>
    </div>
  )

  return (
    <div className="p-6 space-y-3">
      {apps.map((app) => {
        const sc = STATUS_COLORS[app.status]
        const isSel = selected.has(app.id)

        return (
          <div
            key={app.id}
            onClick={() => router.push(`/applications/${app.id}`)}
            className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              isSel 
                ? "bg-blue-500/[0.03] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                : "bg-[#0a0a0a] border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
            }`}
          >
            {/* Selection Checkbox Area */}
            <div 
              onClick={(e) => toggleOne(app.id, e)}
              className="flex-shrink-0"
            >
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                isSel ? "bg-blue-600 border-blue-500" : "bg-white/5 border-white/10 group-hover:border-white/20"
              }`}>
                {isSel && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <h3 className="text-[14px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors truncate">
                  {app.job_title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] font-medium text-gray-500">{app.company_name}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-800" />
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                    <MapPin size={10} /> {app.location || "Remote"}
                  </span>
                </div>
              </div>

              <div className="flex items-center md:justify-end gap-6">
                {/* Stats Metadata */}
                <div className="hidden lg:flex items-center gap-4">
                  {app.salary_max && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">Est. Salary</span>
                      <span className="text-[11px] font-bold text-gray-400">${Number(app.salary_max).toLocaleString()}</span>
                    </div>
                  )}
                  {app.application_date && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">Submitted</span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {new Date(app.application_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Pill */}
                <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border border-white/5 uppercase tracking-tighter whitespace-nowrap ${sc.bg} ${sc.color}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}