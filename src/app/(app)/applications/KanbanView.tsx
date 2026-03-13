"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MapPin, Globe, MoreHorizontal, Briefcase } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"
import { AddJobModal } from "./AddJobModal"

const COL_LABELS: Record<ApplicationStatus, string> = {
  wishlist: "Saved",
  applied: "Applied",
  phone_screen: "Screening",
  interview: "Interviews",
  offer: "Offers",
  rejected: "Closed",
  withdrawn: "Withdrawn",
  ghosted: "Ghosted",
}

const VISIBLE: ApplicationStatus[] = ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected"]

export function KanbanView({ apps }: { apps: Application[]; allApps: Application[] }) {
  const router = useRouter()
  const [addingTo, setAddingTo] = useState<ApplicationStatus | null>(null)

  return (
    <div className="h-full flex gap-4 overflow-x-auto p-6 scrollbar-hide bg-[#05070a]">
      {VISIBLE.map((status) => {
        const columnApps = apps.filter((a) => a.status === status)
        
        return (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                  {COL_LABELS[status]}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                  {columnApps.length}
                </span>
              </div>
              <button 
                onClick={() => setAddingTo(status)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-blue-400 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Column Body */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
              {columnApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => router.push(`/applications/${app.id}`)}
                  className="group relative p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  {/* Subtle Top Glow for high priority */}
                  {app.priority === 'high' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-blue-500/50 blur-[2px]" />
                  )}

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-[13px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {app.job_title}
                    </h3>
                    <MoreHorizontal size={14} className="text-gray-700" />
                  </div>

                  <p className="text-[12px] font-medium text-gray-500 mb-3">{app.company_name}</p>

                  <div className="flex flex-wrap gap-2">
                    {app.work_type && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                        {app.work_type}
                      </span>
                    )}
                    {app.location && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                        <MapPin size={10} /> {app.location}
                      </span>
                    )}
                  </div>

                  {app.salary_max && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">
                        Salary Est.
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        ${Number(app.salary_max).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {columnApps.length === 0 && (
                <div className="h-24 border-2 border-dashed border-white/[0.02] rounded-2xl flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Empty</span>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {addingTo && (
        <AddJobModal 
          onClose={() => setAddingTo(null)} 
          defaultStatus={addingTo} 
        />
      )}
    </div>
  )
}