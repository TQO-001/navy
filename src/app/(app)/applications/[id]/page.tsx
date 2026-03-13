import { getAuthUser } from "@/lib/auth"
import { getApplicationById } from "@/lib/db/queries/applications"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, MapPin, Globe, Briefcase, Calendar, DollarSign, Star } from "lucide-react"
import { STATUS_LABELS, PRIORITY_COLORS } from "@/types"
import type { ApplicationStatus } from "@/types"
import { ActivityLog } from "./ActivityLog"

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

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  
  const { id } = await params
  const app = await getApplicationById(id, user.userId)
  if (!app) notFound()

  const sc = STATUS_COLORS[app.status]
  const pc = PRIORITY_COLORS[app.priority ?? "medium"]

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Header - Glassmorphic */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/applications" className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Jobs
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[13px] font-semibold text-white truncate max-w-[200px] uppercase tracking-wider">
            {app.job_title}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-tighter ${sc.bg} ${sc.color}`}>
            {STATUS_LABELS[app.status]}
          </span>
          <Link href={`/applications/${app.id}/edit`}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Card */}
          <div className="rounded-2xl p-8 bg-[#0a0a0a] border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase size={80} className="text-blue-400" />
            </div>
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                {app.company_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white tracking-tight">{app.job_title}</h1>
                <p className="text-lg font-medium text-gray-400 mt-1">{app.company_name}</p>
                
                <div className="flex items-center gap-5 mt-4 flex-wrap">
                  {app.location && (
                    <span className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                      <MapPin size={14} className="text-blue-500" /> {app.location}
                    </span>
                  )}
                  {app.work_type && (
                    <span className="flex items-center gap-2 text-[13px] text-gray-500 font-medium capitalize">
                      <Briefcase size={14} className="text-purple-500" /> {app.work_type}
                    </span>
                  )}
                  {app.job_url && (
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-blue-400 hover:text-blue-300 font-bold underline-offset-4 hover:underline">
                      <Globe size={14} /> View Listing
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log - Transitions to its own internal blue theme */}
          <ActivityLog appId={app.id} initialEvents={app.events ?? []} />

          {/* Notes & Description */}
          {app.notes && (
            <div className="rounded-2xl p-6 bg-[#0a0a0a] border border-white/5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Internal Notes</h2>
              <p className="text-[14px] text-gray-300 leading-relaxed whitespace-pre-wrap">{app.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Details */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 bg-[#0a0a0a] border border-white/5 space-y-6 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Metadata</h2>
            
            <div className="space-y-4">
              {[
                ["Priority", app.priority, <span key="p" className="text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/5 uppercase" style={{ backgroundColor: pc.bg, color: pc.color }}>{app.priority ?? "medium"}</span>],
                ["Applied Date", app.application_date, app.application_date ? new Date(app.application_date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : null],
                ["Salary Range", (app.salary_min || app.salary_max) ? `$${Number(app.salary_min || 0).toLocaleString()} - $${Number(app.salary_max || 0).toLocaleString()}` : null],
                ["Source", app.source, app.source],
              ].map(([label, raw, display]) => raw ? (
                <div key={label as string} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
                  <div className="text-[13px] font-medium text-gray-300">{display}</div>
                </div>
              ) : null)}
            </div>

            {app.excitement_level && (
              <div className="pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-2">Excitement</span>
                <div className="flex gap-1 text-blue-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < app.excitement_level! ? "currentColor" : "none"} className={i < app.excitement_level! ? "text-blue-400" : "text-gray-800"} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}