"use client"
import { useState, useEffect } from "react"
import {
  Plus, Mail, Linkedin, Trash2, X, Users, Phone,
  Briefcase, ChevronDown, Search, Loader2, UserPlus, Link2
} from "lucide-react"
import type { Contact, Application } from "@/types"

const RELATIONSHIP_LABELS: Record<string, string> = {
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  interviewer: "Interviewer",
  employee: "Employee",
  referral: "Referral",
  other: "Other",
}

const RELATIONSHIP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  recruiter:       { bg: "bg-blue-500/10",    text: "text-blue-400",   border: "border-blue-500/20"   },
  hiring_manager:  { bg: "bg-purple-500/10",  text: "text-purple-400", border: "border-purple-500/20" },
  interviewer:     { bg: "bg-amber-500/10",   text: "text-amber-400",  border: "border-amber-500/20"  },
  employee:        { bg: "bg-emerald-500/10", text: "text-emerald-400",border: "border-emerald-500/20"},
  referral:        { bg: "bg-sky-500/10",     text: "text-sky-400",    border: "border-sky-500/20"    },
  other:           { bg: "bg-zinc-500/10",    text: "text-zinc-400",   border: "border-zinc-500/20"   },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-emerald-600 to-emerald-800",
  "from-amber-600 to-amber-800",
  "from-sky-600 to-sky-800",
  "from-rose-600 to-rose-800",
]

function getAvatarColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
        <Users size={36} className="text-blue-400" />
      </div>
      <h3 className="text-[15px] font-bold text-gray-300 mb-2">No contacts yet</h3>
      <p className="text-[13px] text-gray-600 text-center max-w-xs mb-8 leading-relaxed">
        Add recruiters, hiring managers, referrals, and anyone else involved in your job search.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-blue-600/20"
      >
        <UserPlus size={16} /> Add first contact
      </button>
    </div>
  )
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm({
  apps,
  onSave,
  onCancel,
  saving,
}: {
  apps: Application[]
  onSave: (data: Record<string, string>) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    relationship: "recruiter",
    linkedin_url: "",
    notes: "",
    application_id: "",
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-[#0a0a0a] border border-blue-500/20 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <UserPlus size={16} className="text-blue-400" />
          <h2 className="text-[13px] font-bold text-gray-200">New Contact</h2>
        </div>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <Field label="Full Name *" value={form.name} onChange={v => set("name", v)} placeholder="Jane Smith" required />
        {/* Company */}
        <Field label="Company" value={form.company} onChange={v => set("company", v)} placeholder="Acme Corp" />
        {/* Role / Title */}
        <Field label="Job Title" value={form.role} onChange={v => set("role", v)} placeholder="Technical Recruiter" />
        {/* Relationship */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Relationship</label>
          <select
            value={form.relationship}
            onChange={e => set("relationship", e.target.value)}
            className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            {Object.entries(RELATIONSHIP_LABELS).map(([v, l]) => (
              <option key={v} value={v} className="bg-[#0a0a0a]">{l}</option>
            ))}
          </select>
        </div>
        {/* Email */}
        <Field label="Email" value={form.email} onChange={v => set("email", v)} placeholder="jane@company.com" type="email" />
        {/* Phone */}
        <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} placeholder="+1 555 0100" type="tel" />
        {/* LinkedIn */}
        <div className="sm:col-span-2">
          <Field
            label="LinkedIn URL"
            value={form.linkedin_url}
            onChange={v => set("linkedin_url", v)}
            placeholder="https://linkedin.com/in/..."
            type="url"
          />
        </div>
        {/* Linked Application */}
        {apps.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Linked Job
            </label>
            <select
              value={form.application_id}
              onChange={e => set("application_id", e.target.value)}
              className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="" className="bg-[#0a0a0a]">— No linked job —</option>
              {apps.map(a => (
                <option key={a.id} value={a.id} className="bg-[#0a0a0a]">
                  {a.job_title} @ {a.company_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Notes */}
        <div className={apps.length > 0 ? "" : "sm:col-span-2"}>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            rows={2}
            placeholder="Met at career fair, intro'd by…"
            className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-gray-800"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Contact"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-[12px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label, value, onChange, required, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void
  required?: boolean; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-800"
      />
    </div>
  )
}

// ── Contact Card ──────────────────────────────────────────────────────────────
function ContactCard({
  contact,
  linkedApp,
  onDelete,
}: {
  contact: Contact & { relationship?: string; application_id?: string }
  linkedApp?: Application
  onDelete: (id: string) => void
}) {
  const rel = contact.relationship ?? "other"
  const colors = RELATIONSHIP_COLORS[rel] ?? RELATIONSHIP_COLORS.other
  const avatarGradient = getAvatarColor(contact.name)

  return (
    <div className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all">
      {/* Avatar */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${avatarGradient} flex-shrink-0 shadow-lg`}
      >
        {getInitials(contact.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold text-gray-200 truncate">{contact.name}</p>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${colors.bg} ${colors.border} ${colors.text}`}>
            {RELATIONSHIP_LABELS[rel] ?? rel}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium truncate">
          {[contact.role, contact.company].filter(Boolean).join(" @ ")}
        </p>
        {linkedApp && (
          <div className="flex items-center gap-1 mt-1">
            <Briefcase size={10} className="text-blue-500 flex-shrink-0" />
            <p className="text-[10px] text-blue-400/70 font-medium truncate">
              {linkedApp.job_title} @ {linkedApp.company_name}
            </p>
          </div>
        )}
        {contact.notes && (
          <p className="text-[11px] text-gray-700 mt-1 italic truncate">{contact.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            title={contact.email}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Mail size={14} />
          </a>
        )}
        {(contact as any).phone && (
          <a
            href={`tel:${(contact as any).phone}`}
            title={(contact as any).phone}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-emerald-400 transition-colors"
          >
            <Phone size={14} />
          </a>
        )}
        {contact.linkedin_url && (
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-sky-400 transition-colors"
          >
            <Linkedin size={14} />
          </a>
        )}
        <button
          onClick={() => onDelete(contact.id)}
          title="Delete"
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const [contacts, setContacts] = useState<(Contact & { relationship?: string; application_id?: string })[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterRel, setFilterRel] = useState("all")

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts").then(r => r.json()).catch(() => []),
      fetch("/api/applications").then(r => r.json()).catch(() => []),
    ]).then(([c, a]) => {
      setContacts(Array.isArray(c) ? c : [])
      setApps(Array.isArray(a) ? a : [])
      setLoading(false)
    })
  }, [])

  async function save(data: Record<string, string>) {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const c = await res.json()
        setContacts(p => [c, ...p])
        setShowForm(false)
      } else {
        const d = await res.json()
        setError(d.error ?? "Failed to save contact.")
      }
    } catch {
      setError("Failed to save contact.")
    } finally {
      setSaving(false)
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this contact?")) return
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      setContacts(p => p.filter(c => c.id !== id))
    } catch {
      setError("Failed to delete contact.")
    }
  }

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.role ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    const matchRel = filterRel === "all" || c.relationship === filterRel
    return matchSearch && matchRel
  })

  const grouped = Object.entries(RELATIONSHIP_LABELS).map(([rel, label]) => ({
    rel,
    label,
    contacts: filtered.filter(c => (c.relationship ?? "other") === rel),
  })).filter(g => g.contacts.length > 0)

  const appMap = Object.fromEntries(apps.map(a => [a.id, a]))

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Page Header */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-tight">Contacts</h1>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-0.5">
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium">
            {error}
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        {/* Add Contact Form */}
        {showForm && (
          <ContactForm
            apps={apps}
            onSave={save}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}

        {/* Search + Filter Bar */}
        {contacts.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[13px] text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterRel("all")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterRel === "all" ? "bg-white text-black" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                All
              </button>
              {Object.entries(RELATIONSHIP_LABELS).map(([rel, label]) => (
                <button
                  key={rel}
                  onClick={() => setFilterRel(rel)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                    filterRel === rel
                      ? `${RELATIONSHIP_COLORS[rel].bg} ${RELATIONSHIP_COLORS[rel].border} ${RELATIONSHIP_COLORS[rel].text}`
                      : "border-transparent text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="text-blue-400 animate-spin" />
            <span className="text-[13px] text-gray-600">Loading contacts…</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && contacts.length === 0 && !showForm && (
          <EmptyState onAdd={() => setShowForm(true)} />
        )}

        {/* No Results */}
        {!loading && contacts.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
            <Search size={32} className="text-gray-800 mb-3" />
            <p className="text-[13px] text-gray-600">No contacts match your search.</p>
          </div>
        )}

        {/* Grouped Contact List */}
        {!loading && grouped.map(g => (
          <div key={g.rel}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${RELATIONSHIP_COLORS[g.rel]?.text ?? "text-gray-500"}`}>
                {g.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RELATIONSHIP_COLORS[g.rel]?.bg} ${RELATIONSHIP_COLORS[g.rel]?.border} ${RELATIONSHIP_COLORS[g.rel]?.text}`}>
                {g.contacts.length}
              </span>
            </div>
            <div className="space-y-2">
              {g.contacts.map(c => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  linkedApp={c.application_id ? appMap[c.application_id] : undefined}
                  onDelete={del}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}