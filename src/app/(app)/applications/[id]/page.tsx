import { getAuthUser } from "@/lib/auth"
import { getApplicationById } from "@/lib/db/queries/applications"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, MapPin, Globe, Briefcase, Calendar, DollarSign } from "lucide-react"
import { STATUS_LABELS, PRIORITY_COLORS } from "@/types"
import type { ApplicationStatus } from "@/types"
import { ActivityLog } from "./ActivityLog"

const STATUS_COLORS: Record<ApplicationStatus,{bg:string;color:string}> = {
  wishlist:{bg:"rgba(100,116,139,.15)",color:"#94a3b8"},applied:{bg:"rgba(59,130,246,.15)",color:"#93c5fd"},
  phone_screen:{bg:"rgba(245,158,11,.15)",color:"#fbbf24"},interview:{bg:"rgba(167,139,250,.15)",color:"#c4b5fd"},
  offer:{bg:"rgba(52,211,153,.15)",color:"#34d399"},rejected:{bg:"rgba(239,68,68,.15)",color:"#f87171"},
  withdrawn:{bg:"rgba(249,115,22,.15)",color:"#fb923c"},ghosted:{bg:"rgba(148,163,184,.15)",color:"#94a3b8"},
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const { id } = await params
  const app = await getApplicationById(id, user.userId)
  if (!app) notFound()
  const sc = STATUS_COLORS[app.status]
  const pc = PRIORITY_COLORS[app.priority ?? "medium"]

  return (
    <div style={{ background:"var(--bg)",minHeight:"100vh" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 flex-wrap"
        style={{ background:"var(--surface)",borderBottom:"1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <Link href="/applications" className="flex items-center gap-1.5 text-sm" style={{ color:"var(--muted-2)" }}>
            <ArrowLeft size={15}/> Applications
          </Link>
          <span style={{ color:"var(--border-2)" }}>/</span>
          <span className="text-sm font-medium truncate max-w-xs" style={{ color:"var(--text)" }}>{app.job_title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md" style={{ background:sc.bg,color:sc.color }}>{STATUS_LABELS[app.status]}</span>
          <Link href={"/applications/"+app.id+"/edit"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ border:"1px solid var(--border-2)",color:"var(--muted-2)" }}>
            <Edit size={13}/> Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl p-6" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
                {app.company_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>{app.job_title}</h1>
                <p className="text-base mt-0.5" style={{ color:"var(--muted-2)" }}>{app.company_name}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {app.location && <span className="flex items-center gap-1.5 text-sm" style={{ color:"var(--muted)" }}><MapPin size={13}/>{app.location}</span>}
                  {app.work_type && <span className="flex items-center gap-1.5 text-sm capitalize" style={{ color:"var(--muted)" }}><Briefcase size={13}/>{app.work_type}</span>}
                  {app.job_url && <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm" style={{ color:"var(--amber)" }}><Globe size={13}/>View listing</a>}
                </div>
                {app.excitement_level && (
                  <div className="mt-3 text-sm" style={{ color:"#f59e0b" }} title={`Excitement: ${app.excitement_level}/5`}>
                    {"★".repeat(app.excitement_level)}{"☆".repeat(5-app.excitement_level)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {app.notes && (
            <div className="rounded-xl p-5" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:"var(--muted)" }}>Notes</h2>
              <p className="text-sm whitespace-pre-wrap" style={{ color:"var(--text)",lineHeight:1.7 }}>{app.notes}</p>
            </div>
          )}

          {app.job_description && (
            <div className="rounded-xl p-5" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:"var(--muted)" }}>Job Description</h2>
              <p className="text-sm whitespace-pre-wrap" style={{ color:"var(--muted-2)",lineHeight:1.7 }}>{app.job_description}</p>
            </div>
          )}

          <ActivityLog appId={app.id} initialEvents={app.events ?? []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-4" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--muted)" }}>Details</h2>
            {[
              ["Priority", app.priority, <span key="p" className="text-xs font-medium px-2 py-0.5 rounded capitalize" style={{ background:pc.bg,color:pc.color }}>{app.priority??"—"}</span>],
              ["Source", app.source, app.source],
              ["Salary", (app.salary_min||app.salary_max)?`${app.salary_min?"US$"+Number(app.salary_min).toLocaleString():"—"} – ${app.salary_max?"US$"+Number(app.salary_max).toLocaleString():"—"}`:null, null],
              ["Applied", app.application_date, app.application_date?new Date(app.application_date).toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}):null],
              ["Deadline", app.deadline_date, app.deadline_date?new Date(app.deadline_date).toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}):null],
              ["Follow-up", app.next_follow_up_date, app.next_follow_up_date?new Date(app.next_follow_up_date).toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}):null],
            ].map(([label,raw,display]) => raw ? (
              <div key={label as string} className="flex items-start justify-between gap-3">
                <span className="text-xs" style={{ color:"var(--muted)" }}>{label}</span>
                {typeof display==="string"?<span className="text-xs text-right" style={{ color:"var(--text)" }}>{display}</span>:display}
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </div>
  )
}
