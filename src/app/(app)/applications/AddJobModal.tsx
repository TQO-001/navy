"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface Props { 
  onClose: () => void; 
  defaultStatus?: string 
}

interface FormState {
  company_name: string;
  job_title: string;
  job_url: string;
  status: string;
  priority: string;
  work_type: string;
  location: string;
  salary_min: string;
  salary_max: string;
  application_date: string;
  source: string;
  excitement_level: string;
  notes: string;
  job_description: string;
  deadline_date: string;
  next_follow_up_date: string;
}

export function AddJobModal({ onClose, defaultStatus = "wishlist" }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"details" | "notes">("details")
  
  const [form, setForm] = useState<FormState>({
    company_name: "", job_title: "", job_url: "", status: defaultStatus,
    priority: "medium", work_type: "remote", location: "", salary_min: "", salary_max: "",
    application_date: new Date().toISOString().substring(0, 10),
    source: "", excitement_level: "3", notes: "", job_description: "",
    deadline_date: "", next_follow_up_date: ""
  })

  function set(k: keyof FormState, v: string) { 
    setForm(p => ({ ...p, [k]: v })) 
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setSaving(true); 
    setError("")
    const res = await fetch("/api/applications", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    if (res.ok) { 
      onClose(); 
      router.refresh() 
    } else { 
      const d = await res.json(); 
      setError(d.error || "Failed to save"); 
      setSaving(false) 
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-[14px] font-bold text-gray-100">Add New Application</h2>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Add a new job to track</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Tabs */}
        <div className="flex px-6 border-b border-white/5 bg-white/[0.01]">
          {([["details", "Position Details"], ["notes", "Notes & Description"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                tab === id ? "border-blue-500 text-blue-400" : "border-transparent text-gray-600 hover:text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-tight">{error}</div>}

          {tab === "details" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="Job Title" value={form.job_title} onChange={v => set("job_title", v)} required placeholder="e.g. Senior Frontend Engineer" />
                <F label="Company" value={form.company_name} onChange={v => set("company_name", v)} required placeholder="e.g. Acme Corp" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Sel label="Status" value={form.status} onChange={v => set("status", v)} 
                  options={["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "ghosted"]} 
                />
                <Sel label="Work Type" value={form.work_type} onChange={v => set("work_type", v)} 
                  options={["remote", "onsite", "hybrid"]} 
                />
                <F label="Location" value={form.location} onChange={v => set("location", v)} placeholder="e.g. London / Remote" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="Job URL" value={form.job_url} onChange={v => set("job_url", v)} placeholder="https://linkedin.com/jobs/..." />
                <F label="Applied Date" type="date" value={form.application_date} onChange={v => set("application_date", v)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="Min Salary" type="number" value={form.salary_min} onChange={v => set("salary_min", v)} placeholder="0" />
                <F label="Max Salary" type="number" value={form.salary_max} onChange={v => set("salary_max", v)} placeholder="0" />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Job Description</label>
                <textarea 
                  value={form.job_description} onChange={e => set("job_description", e.target.value)} rows={6}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-gray-800"
                  placeholder="Paste the requirements or description here..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Internal Notes</label>
                <textarea 
                  value={form.notes} onChange={e => set("notes", e.target.value)} rows={4}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-gray-800"
                  placeholder="Questions to ask, research notes, etc..."
                />
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">Cancel</button>
          <button 
            onClick={submit} disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Application"}
          </button>
        </div>
      </div>
    </div>
  )
}

interface FProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}

function F({ label, value, onChange, required, placeholder, type = "text" }: FProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-800" 
      />
    </div>
  )
}

interface SelProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

function Sel({ label, value, onChange, options }: SelProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <select 
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
      >
        {options.map((o: string) => (
          <option key={o} value={o} className="bg-[#0a0a0a]">
            {o.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </option>
        ))}
      </select>
    </div>
  )
}