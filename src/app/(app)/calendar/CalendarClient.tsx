"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"
import type { Application } from "@/types"

export function CalendarClient({ apps }: { apps: Application[] }) {
  const router = useRouter()
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = current.getFullYear()
  const month = current.getMonth()
  
  const prev = () => setCurrent(new Date(year, month - 1, 1))
  const next = () => setCurrent(new Date(year, month + 1, 1))

  // Grid Logic
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  
  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), isCurrentMonth: false })
  }

  function getEventsForDate(date: Date) {
    const dStr = date.toISOString().split('T')[0]
    return apps.filter(app => 
      (app.deadline_date && app.deadline_date.startsWith(dStr)) ||
      (app.next_follow_up_date && app.next_follow_up_date.startsWith(dStr)) ||
      (app.application_date && app.application_date.startsWith(dStr))
    )
  }

  const upcoming = apps
    .filter(app => {
      const d = app.deadline_date || app.next_follow_up_date
      return d && new Date(d) >= today
    })
    .sort((a, b) => {
      const da = a.deadline_date || a.next_follow_up_date || ""
      const db = b.deadline_date || b.next_follow_up_date || ""
      return da.localeCompare(db)
    })
    .slice(0, 5)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Calendar Grid */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                {current.toLocaleString('default', { month: 'long' })}
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-all border border-transparent hover:border-white/5">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all">
              Today
            </button>
            <button onClick={next} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-all border border-transparent hover:border-white/5">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-white/[0.02] border-b border-white/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const events = getEventsForDate(cell.date)
            const isToday = cell.date.toDateString() === today.toDateString()
            
            return (
              <div key={idx} className={`min-h-[120px] p-2 border-b border-r border-white/5 transition-all relative
                ${!cell.isCurrentMonth ? 'opacity-20 bg-black/40' : 'hover:bg-white/[0.02]'}`}>
                <span className={`text-[11px] font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-blue-600/40' : 'text-gray-500'}`}>
                  {cell.date.getDate()}
                </span>
                
                <div className="mt-2 space-y-1">
                  {events.map(app => (
                    <button
                      key={app.id}
                      onClick={() => router.push(`/applications/${app.id}`)}
                      className="w-full text-left px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 truncate hover:bg-blue-500/20 transition-all"
                    >
                      {app.company_name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Sidebar */}
      <div className="lg:w-80 space-y-6">
        <section className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={14} className="text-blue-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Upcoming Intel</h2>
          </div>
          
          {upcoming.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
              <p className="text-[11px] font-medium text-gray-600 italic">No pending deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(app => {
                const targetDate = app.deadline_date || app.next_follow_up_date
                const daysLeft = targetDate ? Math.ceil((new Date(targetDate).getTime() - today.getTime()) / 86400000) : 0
                
                return (
                  <button 
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="w-full group text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    <p className="text-[12px] font-bold text-white group-hover:text-blue-400 transition-colors">{app.job_title}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{app.company_name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${daysLeft <= 3 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {daysLeft === 0 ? 'Due Today' : `${daysLeft}d Remaining`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}