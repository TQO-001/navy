"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Application } from "@/types"

const S_LABELS: Record<string,string> = { wishlist:"Wishlist",applied:"Applied",phone_screen:"Phone Screen",interview:"Interview",offer:"Offer",rejected:"Rejected",withdrawn:"Withdrawn",ghosted:"Ghosted" }

export default function EditApplicationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [form, setForm]       = useState({ company_name:"",job_title:"",job_url:"",status:"wishlist",priority:"medium",work_type:"onsite",location:"",salary_min:"",salary_max:"",application_date:"",source:"",excitement_level:"3",notes:"",job_description:"",deadline_date:"",next_follow_up_date:"" })
  function set(k: string, v: string) { setForm(p=>({...p,[k]:v})) }

  useEffect(() => {
    fetch("/api/applications/"+params.id).then(r=>r.json()).then((app: Application) => {
      setForm({
        company_name:app.company_name??"", job_title:app.job_title??"",
        job_url:app.job_url??"", status:app.status??"wishlist",
        priority:app.priority??"medium", work_type:app.work_type??"onsite",
        location:app.location??"", salary_min:app.salary_min?.toString()??"",
        salary_max:app.salary_max?.toString()??"",
        application_date:app.application_date?app.application_date.substring(0,10):"",
        source:app.source??"", excitement_level:app.excitement_level?.toString()??"3",
        notes:app.notes??"", job_description:app.job_description??"",
        deadline_date:app.deadline_date?app.deadline_date.substring(0,10):"",
        next_follow_up_date:app.next_follow_up_date?app.next_follow_up_date.substring(0,10):"",
      })
      setLoading(false)
    })
  }, [params.id])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("")
    const res = await fetch("/api/applications/"+params.id,{
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        ...form,
        salary_min:form.salary_min?parseInt(form.salary_min):null,
        salary_max:form.salary_max?parseInt(form.salary_max):null,
        excitement_level:form.excitement_level?parseInt(form.excitement_level):null,
        job_url:form.job_url||null, location:form.location||null,
        application_date:form.application_date||null, source:form.source||null,
        notes:form.notes||null, job_description:form.job_description||null,
        deadline_date:form.deadline_date||null, next_follow_up_date:form.next_follow_up_date||null,
      }),
    })
    if (res.ok) { router.push("/applications/"+params.id); router.refresh() }
    else { const d=await res.json(); setError(d.error||"Failed"); setSaving(false) }
  }

  if (loading) return <div className="p-8 text-sm" style={{ color:"var(--muted)" }}>Loading…</div>

  return (
    <div style={{ background:"var(--bg)",minHeight:"100vh" }}>
      <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-3" style={{ background:"var(--surface)",borderBottom:"1px solid var(--border)" }}>
        <Link href={"/applications/"+params.id} className="flex items-center gap-1.5 text-sm" style={{ color:"var(--muted-2)" }}><ArrowLeft size={15}/> Back</Link>
        <span style={{ color:"var(--border-2)" }}>/</span>
        <span className="text-sm font-medium" style={{ color:"var(--text)" }}>Edit Application</span>
      </div>
      <div className="max-w-2xl px-8 py-8">
        {error && <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5" }}>{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <Section title="Position">
            <div className="grid grid-cols-2 gap-4">
              <F label="Company *" value={form.company_name} onChange={v=>set("company_name",v)} required />
              <F label="Job title *" value={form.job_title} onChange={v=>set("job_title",v)} required />
            </div>
            <F label="Job URL" value={form.job_url} onChange={v=>set("job_url",v)} type="url" />
            <div className="grid grid-cols-3 gap-4">
              <Sel label="Status" value={form.status} onChange={v=>set("status",v)} options={Object.keys(S_LABELS)} labels={S_LABELS} />
              <Sel label="Work type" value={form.work_type} onChange={v=>set("work_type",v)} options={["onsite","remote","hybrid"]} />
              <F label="Location" value={form.location} onChange={v=>set("location",v)} />
            </div>
          </Section>
          <Section title="Compensation & Dates">
            <div className="grid grid-cols-2 gap-4">
              <F label="Min salary" value={form.salary_min} onChange={v=>set("salary_min",v)} type="number" />
              <F label="Max salary" value={form.salary_max} onChange={v=>set("salary_max",v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Application date" value={form.application_date} onChange={v=>set("application_date",v)} type="date" />
              <F label="Source" value={form.source} onChange={v=>set("source",v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Deadline" value={form.deadline_date} onChange={v=>set("deadline_date",v)} type="date" />
              <F label="Next follow-up" value={form.next_follow_up_date} onChange={v=>set("next_follow_up_date",v)} type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Sel label="Priority" value={form.priority} onChange={v=>set("priority",v)} options={["low","medium","high"]} />
              <div>
                <label className="block text-xs mb-2" style={{ color:"var(--muted)" }}>Excitement ({form.excitement_level}/5)</label>
                <input type="range" min="1" max="5" value={form.excitement_level} onChange={e=>set("excitement_level",e.target.value)} className="w-full" style={{ accentColor:"var(--amber)",marginTop:4 }} />
              </div>
            </div>
          </Section>
          <Section title="Notes">
            <TA label="Personal notes" value={form.notes} onChange={v=>set("notes",v)} rows={3} />
            <TA label="Job description" value={form.job_description} onChange={v=>set("job_description",v)} rows={5} />
          </Section>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-black disabled:opacity-50" style={{ background:"var(--amber)" }}>
              {saving?"Saving…":"Save changes"}
            </button>
            <Link href={"/applications/"+params.id} className="px-4 py-2.5 text-sm" style={{ color:"var(--muted-2)" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({title,children}:{title:string;children:React.ReactNode}){return<div className="rounded-xl p-6 space-y-4" style={{background:"var(--surface)",border:"1px solid var(--border)"}}><h2 className="text-xs font-semibold uppercase tracking-wider" style={{color:"var(--muted)"}}>{title}</h2>{children}</div>}
function F({label,value,onChange,required,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;placeholder?:string;type?:string}){return<div><label className="block text-xs mb-1.5" style={{color:"var(--muted)"}}>{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)"}}/></div>}
function Sel({label,value,onChange,options,labels}:{label:string;value:string;onChange:(v:string)=>void;options:string[];labels?:Record<string,string>}){return<div><label className="block text-xs mb-1.5" style={{color:"var(--muted)"}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--text)"}}>{options.map(o=><option key={o} value={o}>{labels?.[o]??o.replace(/_/g," ")}</option>)}</select></div>}
function TA({label,value,onChange,rows=3}:{label:string;value:string;onChange:(v:string)=>void;rows?:number}){return<div><label className="block text-xs mb-1.5" style={{color:"var(--muted)"}}>{label}</label><textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none" style={{background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)"}}/></div>}
