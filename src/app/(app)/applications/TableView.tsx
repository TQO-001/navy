"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS, STATUS_ORDER } from "@/types"

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
    <div className="flex items-center justify-center h-64">
      <p className="text-sm" style={{ color:"var(--muted)" }}>No applications found.</p>
    </div>
  )
  return (
    <table className="data-table">
      <thead><tr>
        <th style={{ width:44 }}>
          <input type="checkbox" className="w-4 h-4 rounded accent-amber-500"
            checked={selected.size===apps.length && apps.length>0}
            ref={el => { if (el) el.indeterminate = selected.size>0 && selected.size<apps.length }}
            onChange={toggleAll} />
        </th>
        <th>Job Position</th><th>Company</th><th>Max. Salary</th>
        <th className="hide-mobile">Location</th>
        <th>Status</th>
        <th className="hide-mobile">Date</th>
      </tr></thead>
      <tbody>
        {apps.map(app => (
          <tr key={app.id} className={selected.has(app.id)?"row-selected":""} onClick={() => router.push("/applications/"+app.id)}>
            <td style={{ paddingLeft:14 }} onClick={e=>e.stopPropagation()}>
              <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleOne(app.id)} className="w-4 h-4 rounded accent-amber-500" />
            </td>
            <td><span className="font-medium text-sm" style={{ color:"var(--text)" }}>{app.job_title}</span></td>
            <td>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
                  {app.company_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm" style={{ color:"var(--text)" }}>{app.company_name}</span>
              </div>
            </td>
            <td><span className="text-sm" style={{ color:app.salary_max?"var(--text)":"var(--muted)" }}>{app.salary_max?"US$"+Number(app.salary_max).toLocaleString():"—"}</span></td>
            <td className="hide-mobile"><span className="text-sm" style={{ color:"var(--muted-2)" }}>{app.location??"—"}</span></td>
            <td onClick={e=>e.stopPropagation()}><StatusDropdown appId={app.id} status={app.status} /></td>
            <td className="hide-mobile"><span className="text-sm" style={{ color:"var(--muted-2)" }}>
              {new Date(app.application_date??app.created_at).toLocaleDateString("en",{month:"2-digit",day:"2-digit",year:"numeric"})}
            </span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusDropdown({ appId, status }: { appId: string; status: ApplicationStatus }) {
  const [current, setCurrent] = useState(status)
  const [open, setOpen]       = useState(false)
  const router = useRouter()
  async function update(s: ApplicationStatus) {
    setCurrent(s); setOpen(false)
    await fetch("/api/applications/"+appId,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:s})})
    router.refresh()
  }
  const colors: Record<ApplicationStatus,{bg:string;color:string}> = {
    wishlist:{bg:"rgba(100,116,139,.15)",color:"#94a3b8"},applied:{bg:"rgba(59,130,246,.15)",color:"#93c5fd"},
    phone_screen:{bg:"rgba(245,158,11,.15)",color:"#fbbf24"},interview:{bg:"rgba(167,139,250,.15)",color:"#c4b5fd"},
    offer:{bg:"rgba(52,211,153,.15)",color:"#34d399"},rejected:{bg:"rgba(239,68,68,.15)",color:"#f87171"},
    withdrawn:{bg:"rgba(249,115,22,.15)",color:"#fb923c"},ghosted:{bg:"rgba(148,163,184,.15)",color:"#94a3b8"},
  }
  const c = colors[current]
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md" style={{ background:c.bg,color:c.color }}>
        {STATUS_LABELS[current]} <ChevronDown size={10} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl shadow-2xl z-50 py-1 min-w-[145px]"
          style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)" }}>
          {STATUS_ORDER.map(s => (
            <button key={s} onClick={()=>update(s)} className="w-full text-left px-3 py-2 text-xs"
              style={{ color:s===current?"var(--amber)":"var(--text)",background:s===current?"var(--amber-dim)":"transparent" }}
              onMouseEnter={e=>{if(s!==current)e.currentTarget.style.background="rgba(56,120,220,0.06)"}}
              onMouseLeave={e=>{if(s!==current)e.currentTarget.style.background="transparent"}}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
