"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Application } from "@/types"

export function CalendarClient({ apps }: { apps: Application[] }) {
  const router = useRouter()
  const today  = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  function prev() { setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1)) }
  function next() { setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1)) }

  const year = current.getFullYear(), month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()
  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i=firstDay-1; i>=0; i--) cells.push({ date:new Date(year,month-1,daysInPrev-i), isCurrentMonth:false })
  for (let d=1; d<=daysInMonth; d++) cells.push({ date:new Date(year,month,d), isCurrentMonth:true })
  while (cells.length%7!==0) cells.push({ date:new Date(year,month+1,cells.length-daysInMonth-firstDay+1), isCurrentMonth:false })

  function eventsOnDate(date: Date) {
    const iso = date.toISOString().substring(0,10)
    const events: { app: Application; type: string }[] = []
    for (const app of apps) {
      if (app.application_date?.substring(0,10)===iso) events.push({ app, type:"applied" })
      if (app.deadline_date?.substring(0,10)===iso)    events.push({ app, type:"deadline" })
      if (app.next_follow_up_date?.substring(0,10)===iso) events.push({ app, type:"follow_up" })
    }
    return events
  }

  const upcoming = apps.filter(a => {
    const dates = [a.deadline_date, a.next_follow_up_date].filter(Boolean)
    return dates.some(d => new Date(d!) >= today)
  }).slice(0, 6)

  return (
    <div className="page-pad p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:"var(--text)" }}>Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color:"var(--muted-2)" }}>Deadlines, follow-ups, and application dates</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border:"1px solid var(--border-2)",color:"var(--muted-2)" }}><ChevronLeft size={16}/></button>
          <span className="text-sm font-semibold min-w-[130px] text-center" style={{ color:"var(--text)" }}>
            {current.toLocaleDateString("en",{month:"long",year:"numeric"})}
          </span>
          <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border:"1px solid var(--border-2)",color:"var(--muted-2)" }}><ChevronRight size={16}/></button>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-7 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="text-center text-xs font-semibold py-2" style={{ color:"var(--muted)" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell,i) => {
              const events  = eventsOnDate(cell.date)
              const isToday = cell.date.toISOString().substring(0,10)===today.toISOString().substring(0,10)
              return (
                <div key={i} className={`cal-day ${isToday?"today":""} ${!cell.isCurrentMonth?"other-month":""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color:isToday?"var(--amber)":"var(--text)" }}>
                      {cell.date.getDate()}
                    </span>
                  </div>
                  {events.slice(0,3).map((ev,j) => (
                    <div key={j} className="cal-event" onClick={()=>router.push("/applications/"+ev.app.id)}
                      style={{
                        background: ev.type==="deadline"?"rgba(239,68,68,0.15)":ev.type==="follow_up"?"rgba(245,158,11,0.15)":"rgba(56,189,248,0.10)",
                        color: ev.type==="deadline"?"#f87171":ev.type==="follow_up"?"#f59e0b":"#38bdf8"
                      }}
                      title={`${ev.app.company_name} — ${ev.app.job_title} (${ev.type.replace(/_/g," ")})`}>
                      {ev.app.company_name}
                    </div>
                  ))}
                  {events.length>3 && <div className="text-xs" style={{ color:"var(--muted)" }}>+{events.length-3}</div>}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-4 flex-wrap">
            {[["rgba(56,189,248,0.15)","#38bdf8","Applied"],["rgba(245,158,11,0.15)","#f59e0b","Follow-up"],["rgba(239,68,68,0.15)","#f87171","Deadline"]].map(([bg,color,label])=>(
              <div key={label} className="flex items-center gap-2 text-xs" style={{ color:"var(--muted)" }}>
                <div className="w-3 h-3 rounded" style={{ background:bg as string,border:`1px solid ${color}` }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="w-64 flex-shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:"var(--muted)" }}>Upcoming</h2>
          {upcoming.length===0 ? (
            <p className="text-sm" style={{ color:"var(--muted)" }}>No upcoming deadlines.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(app => {
                const nextDate = [app.deadline_date, app.next_follow_up_date].filter(Boolean).sort()[0]!
                const daysLeft = Math.ceil((new Date(nextDate).getTime()-today.getTime())/86400000)
                return (
                  <div key={app.id}
                    className="rounded-lg px-4 py-3 cursor-pointer transition-colors"
                    style={{ background:"var(--surface)",border:"1px solid var(--border)" }}
                    onClick={()=>router.push("/applications/"+app.id)}>
                    <p className="text-xs font-medium" style={{ color:"var(--text)" }}>{app.job_title}</p>
                    <p className="text-xs" style={{ color:"var(--muted-2)" }}>{app.company_name}</p>
                    <p className="text-xs mt-1 font-medium"
                      style={{ color:daysLeft<=3?"#f87171":daysLeft<=7?"#f59e0b":"var(--muted)" }}>
                      {daysLeft===0?"Today":daysLeft===1?"Tomorrow":`In ${daysLeft} days`}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
