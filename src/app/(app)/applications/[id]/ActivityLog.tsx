"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Phone, Users, Send, FileText, Clock, X, CheckCircle2 } from "lucide-react"

interface Event {
  id: string
  event_type: string
  title: string
  description?: string
  event_date: string
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG FIXED: The original component used "phone_screen" as an event_type, but
// the DB CHECK constraint only allows:
//   applied | status_change | note | interview | phone_call |
//   email   | offer         | rejection | follow_up | other
//
// "phone_screen" is not in that list → DB constraint violation → silent 500.
// Fixed by replacing "phone_screen" with "phone_call" in the select options.
// The API layer also normalises this alias but defence-in-depth is good here.
// ─────────────────────────────────────────────────────────────────────────────

// Label shown in the dropdown vs the value sent to the DB
const EVENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "note",         label: "Note" },
  { value: "phone_call",   label: "Phone / Screen" },
  { value: "interview",    label: "Interview" },
  { value: "email",        label: "Email" },
  { value: "offer",        label: "Offer" },
  { value: "follow_up",    label: "Follow-up" },
  { value: "applied",      label: "Applied" },
  { value: "rejection",    label: "Rejection" },
  { value: "other",        label: "Other" },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  note:         <MessageSquare size={14} />,
  phone_call:   <Phone size={14} />,
  interview:    <Users size={14} />,
  email:        <Send size={14} />,
  offer:        <FileText size={14} />,
  follow_up:    <CheckCircle2 size={14} />,
  applied:      <FileText size={14} />,
  rejection:    <X size={14} />,
  other:        <Clock size={14} />,
}

export function ActivityLog({
  appId,
  initialEvents,
}: {
  appId: string
  initialEvents: Event[]
}) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    event_type: "note",
    title: "",
    description: "",
    event_date: new Date().toISOString().substring(0, 10),
  })

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/applications/${appId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const ev = await res.json()
        setEvents(p => [ev, ...p])
        setForm({
          event_type: "note",
          title: "",
          description: "",
          event_date: new Date().toISOString().substring(0, 10),
        })
        setShowForm(false)
        router.refresh()
      } else {
        const d = await res.json()
        setError(d.error ?? "Failed to log event. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
          Activity Log
        </h2>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
          >
            <Plus size={14} /> Add Entry
          </button>
        ) : (
          <button
            onClick={() => { setShowForm(false); setError("") }}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Add Event Form */}
        {showForm && (
          <form
            onSubmit={addEvent}
            className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Event Type
                </label>
                <select
                  value={form.event_type}
                  onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  {EVENT_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Summary *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                placeholder="e.g. Technical interview with Lead Dev"
                className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Details (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Key takeaways, feedback, or notes…"
                className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-gray-700"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? "Logging…" : "Log Event"}
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {events.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
            <Clock className="mx-auto text-gray-800 mb-3" size={24} />
            <p className="text-sm text-gray-600">
              No activity recorded for this application yet.
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-[11px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider"
              >
                + Log first event
              </button>
            )}
          </div>
        ) : (
          <div className="relative space-y-8">
            {/* Timeline spine */}
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent opacity-20" />

            {events.map(ev => (
              <div key={ev.id} className="flex gap-6 relative group animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center flex-shrink-0 z-10 text-blue-400 group-hover:border-blue-500/50 transition-colors shadow-lg">
                  {TYPE_ICONS[ev.event_type] ?? <Clock size={14} />}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[14px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                      {ev.title}
                    </h3>
                    <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap tabular-nums flex-shrink-0">
                      {new Date(ev.event_date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Event type badge */}
                  <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400/70 border border-blue-500/10">
                    {EVENT_TYPE_OPTIONS.find(o => o.value === ev.event_type)?.label ?? ev.event_type.replace(/_/g, " ")}
                  </span>

                  {ev.description && (
                    <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[13px] text-gray-400 leading-relaxed">
                      {ev.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}