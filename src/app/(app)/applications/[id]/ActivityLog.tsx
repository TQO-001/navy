"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Phone, Users, Send, FileText, Clock, X } from "lucide-react"

interface Event { 
  id: string; 
  event_type: string; 
  title: string; 
  description?: string; 
  event_date: string 
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  note: <MessageSquare size={14} />,
  phone_screen: <Phone size={14} />,
  interview: <Users size={14} />,
  email: <Send size={14} />,
  offer: <FileText size={14} />,
  other: <Clock size={14} />,
}

export function ActivityLog({ appId, initialEvents }: { appId: string; initialEvents: Event[] }) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ 
    event_type: "note", 
    title: "", 
    description: "", 
    event_date: new Date().toISOString().substring(0, 10) 
  })

  async function addEvent(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch("/api/applications/" + appId + "/events", {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(form)
    })
    if (res.ok) {
      const ev = await res.json()
      setEvents(p => [ev, ...p])
      setForm({ 
        event_type: "note", 
        title: "", 
        description: "", 
        event_date: new Date().toISOString().substring(0, 10) 
      })
      setShowForm(false); 
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Activity Log</h2>
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
            <Plus size={14} /> Add Entry
          </button>
        ) : (
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        {showForm && (
          <form onSubmit={addEvent} className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Event Type</label>
                <select 
                  value={form.event_type} 
                  onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  {["note", "phone_screen", "interview", "email", "offer", "other"].map(t => (
                    <option key={t} value={t} className="bg-[#0a0a0a]">{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
                <input 
                  type="date" 
                  value={form.event_date} 
                  onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Summary</label>
              <input 
                value={form.title} 
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} 
                required 
                placeholder="e.g. Technical interview with Lead Dev"
                className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-700" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Details (Optional)</label>
              <textarea 
                value={form.description} 
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                rows={3}
                placeholder="Key takeaways or feedback..."
                className="w-full bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-gray-700" 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? "Processing..." : "Log Event"}
              </button>
            </div>
          </form>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
            <Clock className="mx-auto text-gray-800 mb-3" size={24} />
            <p className="text-sm text-gray-600">No activity recorded for this application yet.</p>
          </div>
        ) : (
          <div className="relative space-y-8">
            {/* The Timeline Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent opacity-20" />
            
            {events.map((ev, i) => (
              <div key={ev.id} className="flex gap-6 relative group animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center flex-shrink-0 z-10 text-blue-400 group-hover:border-blue-500/50 transition-colors shadow-lg">
                  {TYPE_ICONS[ev.event_type] ?? <Clock size={14} />}
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[14px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{ev.title}</h3>
                    <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap tabular-nums">
                      {new Date(ev.event_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
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