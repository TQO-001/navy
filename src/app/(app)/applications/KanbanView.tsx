"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, MapPin, MoreHorizontal, Globe } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { AddJobModal } from "./AddJobModal"

const COL_ACCENT: Record<ApplicationStatus, string> = {
  wishlist:"#64748b", applied:"#3b82f6", phone_screen:"#f59e0b",
  interview:"#8b5cf6", offer:"#10b981", rejected:"#ef4444",
  withdrawn:"#f97316", ghosted:"#94a3b8",
}
const COL_LABELS: Record<ApplicationStatus, string> = {
  wishlist:"Saved Jobs", applied:"Applied Jobs", phone_screen:"Phone Screen",
  interview:"Interviews", offer:"Offered Jobs", rejected:"Rejected Jobs",
  withdrawn:"Withdrawn", ghosted:"Ghosted",
}
const VISIBLE: ApplicationStatus[] = ["wishlist","applied","phone_screen","interview","offer","rejected"]

const WORK_TAG_COLORS: Record<string,{bg:string;color:string}> = {
  remote: { bg:"rgba(56,189,248,0.12)",  color:"#38bdf8" },
  onsite: { bg:"rgba(52,211,153,0.12)",  color:"#34d399" },
  hybrid: { bg:"rgba(167,139,250,0.12)", color:"#a78bfa" },
}

export function KanbanView({ apps, allApps }: { apps: Application[]; allApps: Application[] }) {
  const router = useRouter()
  const [items, setItems]         = useState<Application[]>(apps)
  useEffect(() => { setItems(apps) }, [apps])
  const [dragging, setDragging]   = useState<string | null>(null)
  const [overCol, setOverCol]     = useState<ApplicationStatus | null>(null)
  const [addingToCol, setAddingToCol] = useState<ApplicationStatus | null>(null)
  const dragId = useRef<string | null>(null)

  async function handleDrop(targetCol: ApplicationStatus) {
    const id = dragId.current
    if (!id) return
    const app = items.find(a => a.id === id)
    if (!app || app.status === targetCol) { setDragging(null); setOverCol(null); dragId.current = null; return }
    setItems(prev => prev.map(a => a.id === id ? { ...a, status: targetCol } : a))
    setDragging(null); setOverCol(null); dragId.current = null
    await fetch("/api/applications/" + id, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status: targetCol }),
    })
    router.refresh()
  }

  return (
    <>
      <div className="kanban-board">
        {VISIBLE.map(col => {
          const colApps = items.filter(a => a.status === col)
          const accent  = COL_ACCENT[col]
          return (
            <div key={col}
              className={`kanban-col ${overCol === col ? "drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOverCol(col) }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null) }}
              onDrop={() => handleDrop(col)}
            >
              <div className="kanban-col-header">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                    <span className="text-sm font-semibold" style={{ color:"var(--text)" }}>{COL_LABELS[col]}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background:"var(--surface-3)",color:"var(--muted-2)" }}>
                    {colApps.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ color:"var(--muted)" }}>
                    <MoreHorizontal size={14} />
                  </button>
                  <button onClick={() => setAddingToCol(col)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color:"var(--muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.background="var(--amber-dim)"; e.currentTarget.style.color="var(--amber)" }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--muted)" }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="kanban-col-body">
                {colApps.map(app => (
                  <KanbanCard key={app.id} app={app} isDragging={dragging === app.id}
                    onDragStart={() => { dragId.current = app.id; setDragging(app.id) }}
                    onDragEnd={() => { setDragging(null); setOverCol(null); dragId.current = null }}
                    onClick={() => router.push("/applications/" + app.id)}
                  />
                ))}
                {colApps.length === 0 && (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background:"var(--surface-2)",border:"1px dashed var(--border-2)" }}>
                      <Plus size={14} style={{ color:"var(--muted)" }} />
                    </div>
                    <p className="text-xs text-center" style={{ color:"var(--muted)" }}>Drop cards here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <button onClick={() => setAddingToCol("wishlist")} className="kanban-add-col" title="Add job">
          <Plus size={20} />
        </button>
      </div>

      {addingToCol && (
        <AddJobModal defaultStatus={addingToCol} onClose={() => { setAddingToCol(null); router.refresh() }} />
      )}
    </>
  )
}

function KanbanCard({ app, isDragging, onDragStart, onDragEnd, onClick }: {
  app: Application; isDragging: boolean
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void
}) {
  const workTagColor = app.work_type ? WORK_TAG_COLORS[app.work_type] : null
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      className={`kanban-card ${isDragging ? "is-dragging" : ""}`}>
      {/* Company row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
            {app.company_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs truncate" style={{ color:"var(--muted)" }}>{app.company_name}</span>
        </div>
        <button onClick={e => e.stopPropagation()} className="flex-shrink-0" style={{ color:"var(--muted)" }}>
          <MoreHorizontal size={13} />
        </button>
      </div>

      <p className="text-sm font-semibold mb-1 leading-snug" style={{ color:"var(--text)" }}>{app.job_title}</p>

      {(app.salary_min || app.salary_max) && (
        <p className="text-xs mb-2.5" style={{ color:"var(--muted-2)" }}>
          {app.salary_min
            ? `US$${Number(app.salary_min).toLocaleString()} – US$${Number(app.salary_max ?? app.salary_min).toLocaleString()}`
            : `US$${Number(app.salary_max).toLocaleString()}`}
        </p>
      )}

      {app.notes && !app.salary_min && !app.salary_max && (
        <p className="text-xs mb-2.5 line-clamp-2" style={{ color:"var(--muted)" }}>{app.notes}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        {app.work_type && workTagColor && (
          <span className="job-tag" style={{ background:workTagColor.bg,color:workTagColor.color }}>
            {app.work_type.toUpperCase()}
          </span>
        )}
        {app.location && (
          <span className="job-tag flex items-center gap-0.5"
            style={{ background:"rgba(100,140,200,0.1)",color:"var(--muted-2)" }}>
            <MapPin size={8} />{app.location}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop:"1px solid var(--border)" }}>
        <span className="text-xs" style={{ color:"var(--muted)" }}>
          {app.application_date
            ? new Date(app.application_date).toLocaleDateString("en",{month:"short",day:"numeric"})
            : "No date"}
        </span>
        <div className="flex items-center gap-1">
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={{ color:"var(--muted)" }}>
              <Globe size={12} />
            </a>
          )}
          {app.excitement_level && (
            <span className="text-xs" style={{ color:"#f59e0b" }}>{"★".repeat(app.excitement_level)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
