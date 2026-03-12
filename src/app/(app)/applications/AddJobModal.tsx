"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

const S_LABELS: Record<string,string> = {
  wishlist:"Saved Jobs", applied:"Applied", phone_screen:"Phone Screen",
  interview:"Interview", offer:"Offer", rejected:"Rejected",
  withdrawn:"Withdrawn", ghosted:"Ghosted",
}

interface Props { onClose: () => void; defaultStatus?: string }

export function AddJobModal({ onClose, defaultStatus = "wishlist" }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")
  const [tab, setTab]       = useState<"details"|"notes">("details")
  const [form, setForm]     = useState({
    company_name:"", job_title:"", job_url:"", status: defaultStatus,
    priority:"medium", work_type:"", location:"", salary_min:"", salary_max:"",
    application_date: new Date().toISOString().substring(0,10),
    source:"", excitement_level:"3", notes:"", job_description:"",
    deadline_date:"", next_follow_up_date:""
  })
  function set(k: string, v: string) { setForm(p=>({...p,[k]:v})) }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("")
    const res = await fetch("/api/applications",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        excitement_level: form.excitement_level ? parseInt(form.excitement_level) : null,
        job_url: form.job_url||null, location: form.location||null,
        application_date: form.application_date||null, source: form.source||null,
        notes: form.notes||null, job_description: form.job_description||null,
        deadline_date: form.deadline_date||null, next_follow_up_date: form.next_follow_up_date||null,
        work_type: form.work_type||null,
      })
    })
    if (res.ok) { onClose(); router.refresh() }
    else { const d=await res.json(); setError(d.error||"Failed to save"); setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal-panel">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-0">
          <div className="flex-1 min-w-0">
            <input value={form.job_title} onChange={e=>set("job_title",e.target.value)} placeholder="Job title"
              className="w-full text-2xl font-bold bg-transparent focus:outline-none" style={{ color:"var(--text)" }} />
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background:form.company_name?"var(--amber-dim)":"var(--surface-3)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
                {form.company_name ? form.company_name.charAt(0).toUpperCase() : "?"}
              </div>
              <input value={form.company_name} onChange={e=>set("company_name",e.target.value)} placeholder="Company name"
                className="bg-transparent text-sm focus:outline-none" style={{ color:"var(--muted-2)" }} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ border:"1px solid var(--border-2)",color:"var(--muted-2)" }}>Cancel</button>
            <button onClick={submit} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-black disabled:opacity-50"
              style={{ background:"var(--amber)" }}>{saving?"Saving…":"Save"}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 mt-4 border-b" style={{ borderColor:"var(--border)" }}>
          {(["details","notes"] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className="px-1 py-2 mr-5 text-sm font-medium capitalize border-b-2 transition-colors"
              style={{ borderColor:tab===t?"var(--amber)":"transparent",color:tab===t?"var(--amber)":"var(--muted-2)",marginBottom:-1 }}>
              {t==="details"?"Edit":"Notes"}
            </button>
          ))}
        </div>

        {error && <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-sm" style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5" }}>{error}</div>}

        <form onSubmit={submit} className="p-6 space-y-5">
          {tab==="details" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <F label="Company *" value={form.company_name} onChange={v=>set("company_name",v)} required />
                <F label="Job title *" value={form.job_title} onChange={v=>set("job_title",v)} required />
              </div>
              <F label="Post URL" value={form.job_url} onChange={v=>set("job_url",v)} type="url" placeholder="https://..." />
              <div className="grid grid-cols-2 gap-4">
                <F label="Salary" value={form.salary_max} onChange={v=>set("salary_max",v)} type="number" placeholder="e.g. 80000" />
                <F label="Location" value={form.location} onChange={v=>set("location",v)} placeholder="City, Country" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Sel label="Status" value={form.status} onChange={v=>set("status",v)} options={Object.keys(S_LABELS)} labels={S_LABELS} />
                <Sel label="Work type" value={form.work_type} onChange={v=>set("work_type",v)}
                  options={["","onsite","remote","hybrid"]} labels={{"":"Any","onsite":"On-site","remote":"Remote","hybrid":"Hybrid"}} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Application date" value={form.application_date} onChange={v=>set("application_date",v)} type="date" />
                <F label="Deadline" value={form.deadline_date} onChange={v=>set("deadline_date",v)} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Sel label="Priority" value={form.priority} onChange={v=>set("priority",v)} options={["low","medium","high"]} />
                <F label="Source" value={form.source} onChange={v=>set("source",v)} placeholder="LinkedIn, Referral…" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Excitement ({form.excitement_level}/5)</label>
                <input type="range" min="1" max="5" value={form.excitement_level} onChange={e=>set("excitement_level",e.target.value)} className="w-full" style={{ accentColor:"var(--amber)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Description</label>
                <textarea value={form.job_description} onChange={e=>set("job_description",e.target.value)} rows={4}
                  placeholder="Paste the job description here…"
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                  style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
              </div>
            </>
          )}
          {tab==="notes" && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Personal notes</label>
              <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={12}
                placeholder="Notes about this role, interview prep, contacts…"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <F label="Next follow-up" value={form.next_follow_up_date} onChange={v=>set("next_follow_up_date",v)} type="date" />
                <F label="Min salary" value={form.salary_min} onChange={v=>set("salary_min",v)} type="number" placeholder="Floor salary" />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function F({ label, value, onChange, required, placeholder, type="text" }: {
  label:string; value:string; onChange:(v:string)=>void; required?:boolean; placeholder?:string; type?:string
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
        style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
    </div>
  )
}
function Sel({ label, value, onChange, options, labels }: {
  label:string; value:string; onChange:(v:string)=>void; options:string[]; labels?:Record<string,string>
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
        style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--text)" }}>
        {options.map(o=><option key={o} value={o}>{(labels?.[o]??o.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()))||"—"}</option>)}
      </select>
    </div>
  )
}
