"use client"
import { useState, useEffect } from "react"
import { Plus, Mail, Linkedin, Trash2, X, Users } from "lucide-react"
import type { Contact } from "@/types"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:"", email:"", phone:"", company:"", role:"", linkedin_url:"", notes:"" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/contacts").then(r=>r.json()).then(d=>setContacts(Array.isArray(d)?d:[])).catch(()=>setContacts([])).finally(()=>setLoading(false))
  }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch("/api/contacts",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) })
    if (res.ok) { const c=await res.json(); setContacts(p=>[c,...p]); setShowForm(false); setForm({ name:"",email:"",phone:"",company:"",role:"",linkedin_url:"",notes:"" }) }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("Delete contact?")) return
    await fetch("/api/contacts/"+id,{ method:"DELETE" })
    setContacts(p=>p.filter(c=>c.id!==id))
  }

  return (
    <div className="mx-auto px-8 py-10" style={{ maxWidth:"760px" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:"var(--text)" }}>Contacts</h1>
          <p className="text-sm mt-1" style={{ color:"var(--muted-2)" }}>{contacts.length} contact{contacts.length!==1?"s":""}</p>
        </div>
        <button onClick={()=>setShowForm(v=>!v)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-black clay-lift clay-sm"
          style={{ background:"var(--amber)" }}>
          <Plus size={14}/> Add contact
        </button>
      </div>

      {showForm && (
        <div className="clay p-6 mb-6" style={{ background:"var(--surface)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold" style={{ color:"var(--text)" }}>New contact</h2>
            <button onClick={()=>setShowForm(false)} className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ color:"var(--muted)" }}><X size={15}/></button>
          </div>
          <form onSubmit={add} className="grid grid-cols-2 gap-4">
            {([["Name *","name","text",true],["Email","email","email",false],["Phone","phone","tel",false],["Company","company","text",false],["Role","role","text",false],["LinkedIn URL","linkedin_url","url",false]] as [string,string,string,boolean][]).map(([l,k,t,req])=>(
              <div key={k}>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--muted)" }}>{l}</label>
                <input type={t} value={(form as Record<string,string>)[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} required={req}
                  className="w-full px-3.5 py-2.5 text-sm focus:outline-none clay-input"
                  style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--muted)" }}>Notes</label>
              <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2}
                className="w-full px-3.5 py-2.5 text-sm focus:outline-none resize-none clay-input"
                style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
            <div className="col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50 clay-lift clay-sm"
                style={{ background:"var(--amber)" }}>{saving?"Saving...":"Save contact"}</button>
              <button type="button" onClick={()=>setShowForm(false)} className="text-sm px-4 py-2.5 rounded-xl" style={{ color:"var(--muted-2)" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="text-center py-20" style={{ color:"var(--muted)" }}>Loading...</div>}

      {!loading && contacts.length===0 && !showForm && (
        <div className="clay py-16 text-center" style={{ background:"var(--surface)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 clay-sm"
            style={{ background:"var(--amber-dim)",border:"1px solid var(--amber-border)" }}>
            <Users size={24} style={{ color:"var(--amber)" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color:"var(--text)" }}>No contacts yet</h3>
          <p className="text-sm" style={{ color:"var(--muted-2)" }}>Add recruiters, hiring managers, or connections.</p>
        </div>
      )}

      {!loading && contacts.length>0 && (
        <div className="space-y-3">
          {contacts.map(c=>(
            <div key={c.id} className="clay-sm flex items-center gap-4 px-5 py-4" style={{ background:"var(--surface)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 clay-sm"
                style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--muted-2)" }}>{[c.role,c.company].filter(Boolean).join(" @ ")}</p>
              </div>
              <div className="flex items-center gap-1">
                {c.email && <a href={"mailto:"+c.email} title={c.email} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ color:"var(--muted)" }}><Mail size={14}/></a>}
                {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ color:"var(--muted)" }}><Linkedin size={14}/></a>}
                <button onClick={()=>del(c.id)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ color:"var(--muted)" }}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
