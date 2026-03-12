"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Phone, Users, Send, FileText, Clock } from "lucide-react"

interface Event { id:string; event_type:string; title:string; description?:string; event_date:string }

const TYPE_ICONS: Record<string,React.ReactNode> = {
  note:<MessageSquare size={13}/>, phone_screen:<Phone size={13}/>,
  interview:<Users size={13}/>, email:<Send size={13}/>,
  offer:<FileText size={13}/>, other:<Clock size={13}/>,
}

export function ActivityLog({ appId, initialEvents }: { appId:string; initialEvents:Event[] }) {
  const router = useRouter()
  const [events, setEvents]   = useState<Event[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ event_type:"note", title:"", description:"", event_date: new Date().toISOString().substring(0,10) })

  async function addEvent(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch("/api/applications/"+appId+"/events",{
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
    })
    if (res.ok) {
      const ev = await res.json()
      setEvents(p=>[ev,...p])
      setForm({ event_type:"note", title:"", description:"", event_date:new Date().toISOString().substring(0,10) })
      setShowForm(false); router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl p-5" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--muted)" }}>Activity Log</h2>
        <button onClick={()=>setShowForm(v=>!v)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
          style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
          <Plus size={12}/> Add note
        </button>
      </div>

      {showForm && (
        <form onSubmit={addEvent} className="rounded-lg p-4 mb-4 space-y-3"
          style={{ background:"var(--surface-2)",border:"1px solid var(--border-2)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color:"var(--muted)" }}>Type</label>
              <select value={form.event_type} onChange={e=>setForm(p=>({...p,event_type:e.target.value}))}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--text)" }}>
                {["note","phone_screen","interview","email","offer","other"].map(t=>(
                  <option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color:"var(--muted)" }}>Date</label>
              <input type="date" value={form.event_date} onChange={e=>setForm(p=>({...p,event_date:e.target.value}))}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color:"var(--muted)" }}>Title *</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required placeholder="e.g. Sent follow-up email"
              className="w-full px-2.5 py-1.5 rounded-lg text-sm focus:outline-none"
              style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color:"var(--muted)" }}>Details</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2}
              placeholder="Optional details…"
              className="w-full px-2.5 py-1.5 rounded-lg text-sm focus:outline-none resize-none"
              style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-black disabled:opacity-50"
              style={{ background:"var(--amber)" }}>
              {saving?"Saving…":"Save"}
            </button>
            <button type="button" onClick={()=>setShowForm(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ color:"var(--muted-2)" }}>Cancel</button>
          </div>
        </form>
      )}

      {events.length===0 ? (
        <p className="text-sm text-center py-6" style={{ color:"var(--muted)" }}>No activity yet. Log a note, call, or interview above.</p>
      ) : (
        <div className="space-y-0">
          {events.map((ev,i) => (
            <div key={ev.id} className="flex gap-4 relative">
              {i<events.length-1 && <div className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background:"var(--border)" }} />}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 z-10"
                style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--muted-2)" }}>
                {TYPE_ICONS[ev.event_type] ?? <Clock size={13}/>}
              </div>
              <div className="flex-1 pb-5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color:"var(--text)" }}>{ev.title}</span>
                  <span className="text-xs" style={{ color:"var(--muted)" }}>
                    {new Date(ev.event_date).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}
                  </span>
                </div>
                {ev.description && <p className="text-sm mt-1" style={{ color:"var(--muted-2)" }}>{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
