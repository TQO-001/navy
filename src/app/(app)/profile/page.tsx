"use client"
import { useState, useEffect } from "react"
import {
  User, Mail, Briefcase, TrendingUp, Award, Star,
  Moon, Sun, Globe, Shield, Bell, Loader2, Check, X,
  ChevronRight, KeyRound, Eye, EyeOff,
} from "lucide-react"

interface ProfileData {
  id: string
  name: string
  email: string
  created_at: string
}

interface Stats {
  total: number
  active: number
  interviews: number
  offers: number
  response_rate: number
  offer_rate: number
}

// ── Reusable input style ──────────────────────────────────────────────────
const INPUT_CLS =
  "w-full bg-[#05070a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none transition-colors"
const INPUT_FOCUS =
  "focus:border-[#94DEFF]/40 focus:[box-shadow:0_0_0_2px_rgba(148,222,255,0.08)]"

// ── Toggle Switch ─────────────────────────────────────────────────────────
function Toggle({
  checked, onChange, label, description, icon: Icon,
  variant = "sky",
}: {
  checked: boolean; onChange: (v: boolean) => void
  label: string; description?: string; icon?: React.ElementType
  variant?: "sky" | "pink" | "blue"
}) {
  const variants = {
    sky:  { track: "#94DEFF", glow: "rgba(148,222,255,0.30)" },
    pink: { track: "#FF277F", glow: "rgba(255,39,127,0.35)"  },
    blue: { track: "#2563eb", glow: "rgba(37,99,235,0.30)"   },
  }
  const v = variants[variant]

  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl border transition-all"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: checked ? (variant === "pink" ? "rgba(255,39,127,0.18)" : "rgba(148,222,255,0.15)") : "rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
              color: checked ? v.track : "#6b7280",
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <div>
          <p className="text-[13px] font-bold text-gray-200">{label}</p>
          {description && <p className="text-[11px] text-gray-600 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0"
        style={{
          background: checked ? v.track : "rgba(255,255,255,0.10)",
          boxShadow: checked ? `0 0 12px ${v.glow}` : "none",
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, accent,
}: {
  label: string; value: string | number; icon: React.ElementType
  accent: { bg: string; border: string; color: string; glow?: string }
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
      style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{ background: accent.bg, borderColor: accent.border, color: accent.color }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p
          className="text-xl font-bold leading-none"
          style={{ color: accent.color, textShadow: accent.glow ? `0 0 12px ${accent.glow}` : "none" }}
        >
          {value}
        </p>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────
function Section({ title, children, accent = "sky" }: {
  title: string; children: React.ReactNode; accent?: "sky" | "pink"
}) {
  const borderColor = accent === "pink" ? "rgba(255,39,127,0.12)" : "rgba(148,222,255,0.10)"
  const titleColor  = accent === "pink" ? "#FF277F"                : "#94DEFF"
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="px-6 py-4 border-b" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: titleColor, opacity: 0.8 }}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── PwField ───────────────────────────────────────────────────────────────
function PwField({ label, value, onChange, show, onToggleShow }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggleShow: () => void
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          required minLength={8}
          className={`${INPUT_CLS} ${INPUT_FOCUS} pr-10 pl-4 py-2.5`}
        />
        <button type="button" onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#94DEFF] transition-colors">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats,   setStats  ] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving ] = useState(false)
  const [saved,   setSaved  ] = useState(false)
  const [error,   setError  ] = useState("")
  const [name,    setName   ] = useState("")
  const [email,   setEmail  ] = useState("")
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw]  = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSaved, setPwSaved] = useState(false)
  const [prefs, setPrefs] = useState({
    darkMode: true, publicPortfolio: false, emailNotifications: false, weeklyDigest: false,
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then(r => r.json()).catch(() => null),
      fetch("/api/dashboard").then(r => r.json()).catch(() => null),
    ]).then(([p, s]) => {
      if (p && !p.error) { setProfile(p); setName(p.name ?? ""); setEmail(p.email ?? "") }
      if (s && !s.error) setStats(s)
      try { const saved = localStorage.getItem("navy_prefs"); if (saved) setPrefs(JSON.parse(saved)) } catch {}
      setLoading(false)
    })
  }, [])

  function savePref(key: keyof typeof prefs, val: boolean) {
    const next = { ...prefs, [key]: val }; setPrefs(next)
    try { localStorage.setItem("navy_prefs", JSON.stringify(next)) } catch {}
    if (key === "darkMode") {
      document.documentElement.setAttribute("data-theme", val ? "dark" : "light")
      localStorage.setItem("theme", val ? "dark" : "light")
    }
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSaved(false)
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) })
      if (res.ok) { const u = await res.json(); setProfile(u); setSaved(true); setTimeout(() => setSaved(false), 2500) }
      else { const d = await res.json(); setError(d.error ?? "Failed to save.") }
    } catch { setError("Something went wrong.") }
    finally { setSaving(false) }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault(); setPwError("")
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return }
    if (pwForm.next.length < 8) { setPwError("Minimum 8 characters."); return }
    setPwSaved(true)
    setTimeout(() => { setPwSaved(false); setShowPwForm(false); setPwForm({ current: "", next: "", confirm: "" }) }, 2000)
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en", { month: "long", year: "numeric" })
    : "—"

  // Stat card accents — pink for high-impact metrics
  const statCards = stats ? [
    { label: "Total Applications", value: stats.total,              icon: Briefcase,  accent: { bg: "rgba(148,222,255,0.08)", border: "rgba(148,222,255,0.18)", color: "#94DEFF" } },
    { label: "Active Pipeline",    value: stats.active,             icon: TrendingUp, accent: { bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.18)",   color: "#60a5fa" } },
    { label: "Interviews",         value: stats.interviews,         icon: Star,       accent: { bg: "rgba(255,39,127,0.08)", border: "rgba(255,39,127,0.20)", color: "#FF277F", glow: "rgba(255,39,127,0.4)" } },
    { label: "Offers",             value: stats.offers,             icon: Award,      accent: { bg: "rgba(255,39,127,0.08)", border: "rgba(255,39,127,0.20)", color: "#FF277F", glow: "rgba(255,39,127,0.4)" } },
    { label: "Response Rate",      value: `${stats.response_rate}%`, icon: TrendingUp, accent: { bg: "rgba(148,222,255,0.08)", border: "rgba(148,222,255,0.18)", color: "#94DEFF" } },
    { label: "Offer Rate",         value: `${stats.offer_rate}%`,   icon: Award,      accent: { bg: "rgba(255,39,127,0.08)", border: "rgba(255,39,127,0.20)", color: "#FF277F", glow: "rgba(255,39,127,0.4)" } },
  ] : []

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center gap-3">
      <Loader2 size={20} className="animate-spin" style={{ color: "#94DEFF" }} />
      <span className="text-[13px] text-gray-600">Loading profile…</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: "rgba(255,39,127,0.04)" }} />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[150px]" style={{ background: "rgba(148,222,255,0.04)" }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md relative" style={{ background: "rgba(10,10,10,0.80)", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[18px] font-bold text-white tracking-tight">Profile & Settings</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-0.5 text-gray-600">
            Account · Preferences · Security
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 relative">
        {/* ── Identity Card ── */}
        <div
          className="rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden border"
          style={{ background: "#0a0a0a", borderColor: "rgba(148,222,255,0.12)" }}
        >
          {/* Sky glow in corner */}
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[70px]" style={{ background: "rgba(148,222,255,0.06)" }} />
          {/* Avatar — pink gradient */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl flex-shrink-0 relative z-10"
            style={{
              background: "linear-gradient(135deg, #FF277F 0%, #2563eb 100%)",
              boxShadow: "0 0 30px rgba(255,39,127,0.30), 0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {profile?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white">{profile?.name ?? "User"}</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                Member since {memberSince}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{
                  background: "rgba(255,39,127,0.10)",
                  borderColor: "rgba(255,39,127,0.25)",
                  color: "#FF277F",
                }}
              >
                Navy Pro
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <Section title="Your Stats" accent="pink">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statCards.map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </Section>
        )}

        {/* ── Account Details ── */}
        <Section title="Account Details" accent="sky">
          <form onSubmit={saveAccount} className="space-y-4">
            {error && (
              <div className="flex items-center justify-between p-3 rounded-xl border text-[12px] font-medium" style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}>
                {error}<button type="button" onClick={() => setError("")}><X size={14} /></button>
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 p-3 rounded-xl border text-[12px] font-bold" style={{ background: "rgba(148,222,255,0.06)", borderColor: "rgba(148,222,255,0.22)", color: "#94DEFF" }}>
                <Check size={14} /> Changes saved
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={`${INPUT_CLS} ${INPUT_FOCUS} pl-9 pr-4 py-2.5`} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${INPUT_CLS} ${INPUT_FOCUS} pl-9 pr-4 py-2.5`} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 btn-blue-sky">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
            </button>
          </form>
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences" accent="sky">
          <div className="space-y-3">
            <Toggle label="Dark Mode"           description="Use the dark theme across the app"            icon={prefs.darkMode ? Moon : Sun} checked={prefs.darkMode}            onChange={v => savePref("darkMode", v)}            variant="sky"  />
            <Toggle label="Public Portfolio"    description="Allow others to view your public profile"    icon={Globe}                       checked={prefs.publicPortfolio}    onChange={v => savePref("publicPortfolio", v)}    variant="pink" />
            <Toggle label="Email Notifications" description="Receive email reminders for upcoming deadlines" icon={Bell}                      checked={prefs.emailNotifications} onChange={v => savePref("emailNotifications", v)} variant="sky"  />
            <Toggle label="Weekly Digest"       description="A weekly summary of your job search activity"  icon={TrendingUp}                 checked={prefs.weeklyDigest}       onChange={v => savePref("weeklyDigest", v)}       variant="blue" />
          </div>
        </Section>

        {/* ── Security ── */}
        <Section title="Security" accent="sky">
          <div className="space-y-3">
            <button
              onClick={() => setShowPwForm(v => !v)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all group"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(148,222,255,0.18)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }}>
                  <KeyRound size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-gray-200">Change Password</p>
                  <p className="text-[11px] text-gray-600">Update your account password</p>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-600 group-hover:text-[#94DEFF] transition-all duration-200 ${showPwForm ? "rotate-90" : ""}`} />
            </button>

            {showPwForm && (
              <form onSubmit={savePassword} className="rounded-2xl border p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: "rgba(148,222,255,0.03)", borderColor: "rgba(148,222,255,0.12)" }}>
                {pwError && <div className="p-3 rounded-xl border text-[12px] font-medium" style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}>{pwError}</div>}
                {pwSaved && <div className="flex items-center gap-2 p-3 rounded-xl border text-[12px] font-bold" style={{ background: "rgba(148,222,255,0.06)", borderColor: "rgba(148,222,255,0.22)", color: "#94DEFF" }}><Check size={14} /> Password updated</div>}
                <PwField label="Current Password" value={pwForm.current} onChange={v => setPwForm(p => ({ ...p, current: v }))} show={showPw} onToggleShow={() => setShowPw(v => !v)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <PwField label="New Password"     value={pwForm.next}    onChange={v => setPwForm(p => ({ ...p, next: v }))}    show={showPw} onToggleShow={() => setShowPw(v => !v)} />
                  <PwField label="Confirm Password" value={pwForm.confirm} onChange={v => setPwForm(p => ({ ...p, confirm: v }))} show={showPw} onToggleShow={() => setShowPw(v => !v)} />
                </div>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest btn-blue-sky">
                  Update Password
                </button>
              </form>
            )}

            <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
              <Shield size={16} className="mt-0.5 flex-shrink-0 text-gray-600" />
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Your data is encrypted at rest and never shared with third parties.
                Navy uses bcrypt for password hashing and short-lived JWT tokens for sessions.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone" accent="pink">
          <div
            className="flex items-center justify-between p-4 rounded-2xl border"
            style={{ background: "rgba(255,39,127,0.04)", borderColor: "rgba(255,39,127,0.14)" }}
          >
            <div>
              <p className="text-[13px] font-bold text-gray-300">Delete Account</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Permanently remove your account and all data. Cannot be undone.</p>
            </div>
            <button
              onClick={() => confirm("Are you sure? This cannot be undone.") && alert("Contact support to delete your account.")}
              className="px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider border transition-all hover:brightness-125 flex-shrink-0 ml-4"
              style={{ background: "rgba(255,39,127,0.10)", borderColor: "rgba(255,39,127,0.25)", color: "#FF277F" }}
            >
              Delete
            </button>
          </div>
        </Section>
      </div>
    </div>
  )
}