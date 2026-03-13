"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, MapPin, DollarSign, Calendar } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS, STATUS_ORDER } from "@/types"

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

export function TableView({
  apps, selected, setSelected,
}: { apps: Application[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const router = useRouter()

  function toggleAll() {
    if (selected.size === apps.length) setSelected(new Set())
    else setSelected(new Set(apps.map(a => a.id)))
  }

  function toggleOne(id: string) {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n)
  }

  if (!apps.length) return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl m-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">No applications found</p>
    </div>
  )

  return (
    <div className="px-6 py-4 overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left">
            <th className="px-4 py-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all cursor-pointer"
                checked={selected.size === apps.length && apps.length > 0}
                ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < apps.length }}
                onChange={toggleAll} 
              />
            </th>
            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Position</th>
            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Company</th>
            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
            <th className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Applied</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => {
            const sc = STATUS_COLORS[app.status]
            const isSel = selected.has(app.id)

            return (
              <tr 
                key={app.id}
                onClick={() => router.push(`/applications/${app.id}`)}
                className={`group cursor-pointer transition-all duration-200 ${isSel ? 'bg-blue-500/[0.03]' : 'bg-[#0a0a0a] hover:bg-white/[0.02]'}`}
              >
                <td className="px-4 py-4 rounded-l-xl border-y border-l border-white/5 group-hover:border-white/10" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all cursor-pointer"
                    checked={isSel} 
                    onChange={() => toggleOne(app.id)} 
                  />
                </td>
                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                      {app.job_title}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1 font-medium">
                      <MapPin size={10} /> {app.location || "Remote"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                  <span className="text-[13px] font-semibold text-gray-400">{app.company_name}</span>
                </td>
                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border border-white/5 uppercase tracking-tighter ${sc.bg} ${sc.color}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td className="px-4 py-4 rounded-r-xl border-y border-r border-white/5 group-hover:border-white/10 text-right">
                  <span className="text-[11px] font-bold text-gray-600 tabular-nums">
                    {app.application_date ? new Date(app.application_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}