"use client"
import { useState, useEffect } from "react"

export default function ProfilePage() {
  const [form, setForm]     = useState({ name:"", email:"" })
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/profile").then(r=>r.json()).then(u=>{ if(u&&!u.error) setForm({ name:u.name??"", email:u.email??"" }) }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/profile",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) })
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  if (loading) return <div className="p-8 text-sm" style={{ color:"var(--muted)" }}>Loading…</div>

  return (
    <div className="page-pad p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-8" style={{ color:"var(--text)" }}>Profile</h1>
      {saved && (
        <div className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{ background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",color:"#34d399" }}>
          Changes saved ✓
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        {([["Full name","name","text"],["Email","email","email"]] as [string,string,string][]).map(([l,k,t])=>(
          <div key={k}>
            <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>{l}</label>
            <input type={t} value={(form as Record<string,string>)[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
          </div>
        ))}
        <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background:"var(--amber)" }}>
          Save changes
        </button>
      </form>
    </div>
  )
}
