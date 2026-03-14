"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Zap } from "lucide-react"
import type { Application } from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: safe date string extraction
//
// The postgres driver can return DATE columns as either:
//   • A JS Date object (when not cast to ::text)
//   • A "YYYY-MM-DD" string (when cast to ::text in the query)
//   • null / undefined
//
// We normalise everything to "YYYY-MM-DD" or "" here so .startsWith() is safe.
// ─────────────────────────────────────────────────────────────────────────────
function toDateStr(val: unknown): string {
  if (!val) return ""
  if (val instanceof Date) return val.toISOString().split("T")[0]
  if (typeof val === "string") return val.split("T")[0]  // handles ISO datetime strings too
  return ""
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

export function CalendarClient({ apps }: { apps: Application[] }) {
  const router = useRouter()
  const today  = new Date()
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year  = current.getFullYear()
  const month = current.getMonth()

  const prev = () => setCurrent(new Date(year, month - 1, 1))
  const next = () => setCurrent(new Date(year, month + 1, 1))

  // ── Calendar grid ──────────────────────────────────────────────────────
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), isCurrentMonth: false })

  // ── FIX: use toDateStr() so we never call .startsWith() on a Date object ─
  function getEventsForDate(date: Date): Application[] {
    const dStr = date.toISOString().split("T")[0]  // always "YYYY-MM-DD"
    return apps.filter(app =>
      toDateStr(app.deadline_date).startsWith(dStr)        ||
      toDateStr(app.next_follow_up_date).startsWith(dStr)  ||
      toDateStr(app.application_date).startsWith(dStr)
    )
  }

  // ── Upcoming sidebar ───────────────────────────────────────────────────
  const upcoming = apps
    .filter(app => {
      const d = toDateStr(app.deadline_date) || toDateStr(app.next_follow_up_date)
      return d && new Date(d) >= today
    })
    .sort((a, b) => {
      // FIX: convert to strings before comparing — Date.localeCompare doesn't exist
      const da = toDateStr(a.deadline_date) || toDateStr(a.next_follow_up_date)
      const db = toDateStr(b.deadline_date) || toDateStr(b.next_follow_up_date)
      return da.localeCompare(db)
    })
    .slice(0, 6)

  const todayStr = today.toISOString().split("T")[0]

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Main Calendar Grid ── */}
      <div
        className="flex-1 rounded-2xl overflow-hidden shadow-2xl border"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                background: "rgba(148,222,255,0.08)",
                borderColor: "rgba(148,222,255,0.22)",
              }}
            >
              <CalendarIcon size={20} style={{ color: "#94DEFF" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                {MONTHS[month]}
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                {year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              className="p-2 rounded-xl text-gray-400 hover:text-white border border-transparent hover:border-white/5 hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              Today
            </button>
            <button
              onClick={next}
              className="p-2 rounded-xl text-gray-400 hover:text-white border border-transparent hover:border-white/5 hover:bg-white/5 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div
          className="grid grid-cols-7 border-b"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {DAYS.map(day => (
            <div
              key={day}
              className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const events  = getEventsForDate(cell.date)
            const cellStr = cell.date.toISOString().split("T")[0]
            const isToday = cellStr === todayStr

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 border-b border-r transition-colors relative ${
                  !cell.isCurrentMonth
                    ? "opacity-20"
                    : "hover:bg-white/[0.015]"
                }`}
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                {/* Date number */}
                <span
                  className={`text-[11px] font-bold flex items-center justify-center w-6 h-6 rounded-lg ${
                    isToday ? "text-white font-black" : "text-gray-500"
                  }`}
                  style={
                    isToday
                      ? {
                          background: "#FF277F",
                          boxShadow: "0 0 14px rgba(255,39,127,0.55)",
                        }
                      : {}
                  }
                >
                  {cell.date.getDate()}
                </span>

                {/* Event chips */}
                <div className="mt-1.5 space-y-1">
                  {events.slice(0, 2).map(app => (
                    <button
                      key={app.id}
                      onClick={() => router.push(`/applications/${app.id}`)}
                      className="w-full text-left px-2 py-0.5 rounded-md text-[9px] font-bold truncate transition-all hover:brightness-125"
                      style={{
                        background: "rgba(148,222,255,0.08)",
                        border: "1px solid rgba(148,222,255,0.20)",
                        color: "#94DEFF",
                      }}
                    >
                      {app.company_name}
                    </button>
                  ))}
                  {events.length > 2 && (
                    <span className="text-[8px] font-bold text-gray-600 pl-1">
                      +{events.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Upcoming Sidebar ── */}
      <div className="lg:w-80 space-y-4">
        <section
          className="p-6 rounded-2xl border shadow-xl"
          style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap size={14} style={{ color: "#FF277F" }} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Upcoming Deadlines
            </h2>
          </div>

          {upcoming.length === 0 ? (
            <div
              className="py-8 text-center rounded-xl border border-dashed"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-[11px] font-medium text-gray-600 italic">
                No pending deadlines
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(app => {
                const targetStr  = toDateStr(app.deadline_date) || toDateStr(app.next_follow_up_date)
                const targetDate = targetStr ? new Date(targetStr) : null
                const daysLeft   = targetDate
                  ? Math.ceil((targetDate.getTime() - today.getTime()) / 86_400_000)
                  : 0
                const isUrgent = daysLeft <= 3

                return (
                  <button
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="w-full group text-left p-3 rounded-xl border transition-all"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: isUrgent
                        ? "rgba(255,39,127,0.20)"
                        : "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = isUrgent
                        ? "rgba(255,39,127,0.40)"
                        : "rgba(148,222,255,0.25)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isUrgent
                        ? "rgba(255,39,127,0.20)"
                        : "rgba(255,255,255,0.05)"
                    }}
                  >
                    <p
                      className="text-[12px] font-bold text-white transition-colors"
                      style={{ color: isUrgent ? "#FF277F" : "white" }}
                    >
                      {app.job_title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                      {app.company_name}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg"
                        style={
                          isUrgent
                            ? {
                                background: "rgba(255,39,127,0.12)",
                                color: "#FF277F",
                                border: "1px solid rgba(255,39,127,0.25)",
                              }
                            : {
                                background: "rgba(148,222,255,0.08)",
                                color: "#94DEFF",
                                border: "1px solid rgba(148,222,255,0.18)",
                              }
                        }
                      >
                        {daysLeft === 0
                          ? "Due Today"
                          : daysLeft < 0
                          ? "Overdue"
                          : `${daysLeft}d left`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Legend */}
        <div
          className="p-4 rounded-2xl border"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.04)",
          }}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 mb-3">
            Legend
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: "#FF277F", boxShadow: "0 0 6px rgba(255,39,127,0.5)" }}
              />
              <span className="text-[10px] text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  background: "rgba(148,222,255,0.12)",
                  border: "1px solid rgba(148,222,255,0.3)",
                }}
              />
              <span className="text-[10px] text-gray-600">Deadline / follow-up</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  background: "rgba(255,39,127,0.12)",
                  border: "1px solid rgba(255,39,127,0.3)",
                }}
              />
              <span className="text-[10px] text-gray-600">Urgent (≤ 3 days)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}