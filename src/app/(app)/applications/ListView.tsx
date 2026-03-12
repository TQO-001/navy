"use client"
import { useRouter } from "next/navigation"
import { MapPin, DollarSign, Calendar, Star } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS } from "@/types"

const STATUS_COLORS: Record<ApplicationStatus,{bg:string;color:string}> = {
  wishlist:     {bg:"rgba(100,116,139,.15)",color:"#94a3b8"},
  applied:      {bg:"rgba(59,130,246,.15)", color:"#93c5fd"},
  phone_screen: {bg:"rgba(245,158,11,.15)", color:"#fbbf24"},
  interview:    {bg:"rgba(167,139,250,.15)",color:"#c4b5fd"},
  offer:        {bg:"rgba(52,211,153,.15)", color:"#34d399"},
  rejected:     {bg:"rgba(239,68,68,.15)",  color:"#f87171"},
  withdrawn:    {bg:"rgba(249,115,22,.15)", color:"#fb923c"},
  ghosted:      {bg:"rgba(148,163,184,.15)",color:"#94a3b8"},
}

export function ListView({
  apps, selected, setSelected,
}: { apps: Application[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const router = useRouter()
  if (!apps.length) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm" style={{ color:"var(--muted)" }}>No applications found.</p>
    </div>
  )
  return (
    <div className="p-4 space-y-3">
      {apps.map(app => {
        const c   = STATUS_COLORS[app.status]
        const sel = selected.has(app.id)
        return (
          <div key={app.id}
            className="rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all"
            style={{ background:sel?"rgba(245,158,11,0.06)":"var(--surface)", border:sel?"1px solid var(--amber-border)":"1px solid var(--border)" }}
            onClick={() => router.push("/applications/" + app.id)}>
            <div onClick={e => { e.stopPropagation(); const n=new Set(selected); n.has(app.id)?n.delete(app.id):n.add(app.id); setSelected(n) }}>
              <input type="checkbox" checked={sel} onChange={() => {}} className="w-4 h-4 rounded accent-amber-500 mt-0.5 cursor-pointer" />
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
              {app.company_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-sm" style={{ color:"var(--text)" }}>{app.job_title}</p>
                  <p className="text-xs mt-0.5" style={{ color:"var(--muted-2)" }}>{app.company_name}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0"
                  style={{ background:c.bg,color:c.color }}>{STATUS_LABELS[app.status]}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {app.location && <span className="flex items-center gap-1 text-xs" style={{ color:"var(--muted)" }}><MapPin size={11}/>{app.location}</span>}
                {app.salary_max && <span className="flex items-center gap-1 text-xs" style={{ color:"var(--muted)" }}><DollarSign size={11}/>US${Number(app.salary_max).toLocaleString()}</span>}
                {app.application_date && <span className="flex items-center gap-1 text-xs" style={{ color:"var(--muted)" }}><Calendar size={11}/>{new Date(app.application_date).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}</span>}
                {app.excitement_level && <span className="flex items-center gap-1 text-xs" style={{ color:"#f59e0b" }}><Star size={11}/>{"★".repeat(app.excitement_level)}</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
