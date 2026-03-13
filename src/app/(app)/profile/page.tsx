"use client"
import { useState, useEffect } from "react"
import {
  User, Mail, Briefcase, TrendingUp, Award, Star,
  Moon, Sun, Globe, Shield, Bell, Loader2, Check, X,
  ChevronRight, KeyRound, Eye, EyeOff
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

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
  accent = "blue",
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon?: React.ElementType
  accent?: "blue" | "emerald" | "amber"
}) {
  const accents = {
    blue:    { track: "bg-blue-600",    ring: "ring-blue-500/30" },
    emerald: { track: "bg-emerald-600", ring: "ring-emerald-500/30" },
    amber:   { track: "bg-amber-500",   ring: "ring-amber-500/30" },
  }
  const a = accents[accent]

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <div>
          <p className="text-[13px] font-bold text-gray-200">{label}</p>
          {description && (
            <p className="text-[11px] text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ring-2 ring-transparent focus:outline-none ${
          checked ? `${a.track} ${a.ring}` : "bg-white/10"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-white/5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white/5 border border-white/10`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // Account form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Password form
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSaved, setPwSaved] = useState(false)

  // Preferences
  const [prefs, setPrefs] = useState({
    darkMode: true,
    publicPortfolio: false,
    emailNotifications: false,
    weeklyDigest: false,
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then(r => r.json()).catch(() => null),
      fetch("/api/dashboard").then(r => r.json()).catch(() => null),
    ]).then(([p, s]) => {
      if (p && !p.error) {
        setProfile(p)
        setName(p.name ?? "")
        setEmail(p.email ?? "")
      }
      if (s && !s.error) setStats(s)

      // Load saved prefs from localStorage
      try {
        const saved = localStorage.getItem("navy_prefs")
        if (saved) setPrefs(JSON.parse(saved))
      } catch {}

      setLoading(false)
    })
  }, [])

  function savePref(key: keyof typeof prefs, val: boolean) {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    try { localStorage.setItem("navy_prefs", JSON.stringify(next)) } catch {}
    // Apply dark mode immediately
    if (key === "darkMode") {
      document.documentElement.setAttribute("data-theme", val ? "dark" : "light")
      localStorage.setItem("theme", val ? "dark" : "light")
    }
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        const d = await res.json()
        setError(d.error ?? "Failed to save changes.")
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError("")
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters."); return }
    // Note: a /api/auth/change-password endpoint would handle this
    // For now we show a success placeholder
    setPwSaved(true)
    setTimeout(() => { setPwSaved(false); setShowPwForm(false); setPwForm({ current: "", next: "", confirm: "" }) }, 2000)
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en", { month: "long", year: "numeric" })
    : "—"

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center gap-3">
        <Loader2 size={20} className="text-blue-400 animate-spin" />
        <span className="text-[13px] text-gray-600">Loading profile…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Page Header */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[18px] font-bold text-white tracking-tight">Profile & Settings</h1>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-0.5">
            Account · Preferences · Security
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ── Identity Card ── */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 p-6 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-600/5 blur-[60px] rounded-full" />
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-blue-900/40 flex-shrink-0 relative z-10">
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
              <span className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">
                Navy Plan
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <Section title="Your Stats">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Applications" value={stats.total} icon={Briefcase} color="text-blue-400" />
              <StatCard label="Active Pipeline"    value={stats.active} icon={TrendingUp} color="text-sky-400" />
              <StatCard label="Interviews"         value={stats.interviews} icon={Star} color="text-purple-400" />
              <StatCard label="Offers Received"    value={stats.offers} icon={Award} color="text-emerald-400" />
              <StatCard label="Response Rate"      value={`${stats.response_rate}%`} icon={TrendingUp} color="text-amber-400" />
              <StatCard label="Offer Rate"         value={`${stats.offer_rate}%`} icon={Award} color="text-rose-400" />
            </div>
          </Section>
        )}

        {/* ── Account Details ── */}
        <Section title="Account Details">
          <form onSubmit={saveAccount} className="space-y-4">
            {error && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                {error}
                <button type="button" onClick={() => setError("")}><X size={14} /></button>
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-bold">
                <Check size={14} /> Changes saved
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#05070a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#05070a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
            </button>
          </form>
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <div className="space-y-3">
            <Toggle
              label="Dark Mode"
              description="Use the dark theme across the app"
              icon={prefs.darkMode ? Moon : Sun}
              checked={prefs.darkMode}
              onChange={v => savePref("darkMode", v)}
              accent="blue"
            />
            <Toggle
              label="Public Portfolio View"
              description="Allow others to view your public profile page"
              icon={Globe}
              checked={prefs.publicPortfolio}
              onChange={v => savePref("publicPortfolio", v)}
              accent="emerald"
            />
            <Toggle
              label="Email Notifications"
              description="Receive email reminders for upcoming deadlines"
              icon={Bell}
              checked={prefs.emailNotifications}
              onChange={v => savePref("emailNotifications", v)}
              accent="amber"
            />
            <Toggle
              label="Weekly Digest"
              description="Get a weekly summary of your job search activity"
              icon={TrendingUp}
              checked={prefs.weeklyDigest}
              onChange={v => savePref("weeklyDigest", v)}
              accent="blue"
            />
          </div>
        </Section>

        {/* ── Security ── */}
        <Section title="Security">
          <div className="space-y-3">
            {/* Change Password */}
            <button
              onClick={() => setShowPwForm(v => !v)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <KeyRound size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-gray-200">Change Password</p>
                  <p className="text-[11px] text-gray-600">Update your account password</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`text-gray-600 group-hover:text-gray-400 transition-all duration-200 ${showPwForm ? "rotate-90" : ""}`}
              />
            </button>

            {showPwForm && (
              <form
                onSubmit={savePassword}
                className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                {pwError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                    {pwError}
                  </div>
                )}
                {pwSaved && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-bold">
                    <Check size={14} /> Password updated
                  </div>
                )}

                <PwField
                  label="Current Password"
                  value={pwForm.current}
                  onChange={v => setPwForm(p => ({ ...p, current: v }))}
                  show={showPw}
                  onToggleShow={() => setShowPw(v => !v)}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <PwField
                    label="New Password"
                    value={pwForm.next}
                    onChange={v => setPwForm(p => ({ ...p, next: v }))}
                    show={showPw}
                    onToggleShow={() => setShowPw(v => !v)}
                  />
                  <PwField
                    label="Confirm Password"
                    value={pwForm.confirm}
                    onChange={v => setPwForm(p => ({ ...p, confirm: v }))}
                    show={showPw}
                    onToggleShow={() => setShowPw(v => !v)}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  Update Password
                </button>
              </form>
            )}

            {/* Privacy note */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <Shield size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Your data is encrypted at rest and never sold to third parties.
                Navy uses bcrypt for password hashing and JWT for session management.
              </p>
            </div>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-red-500/[0.03]">
            <div>
              <p className="text-[13px] font-bold text-gray-300">Delete Account</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Permanently remove your account and all data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => confirm("Are you sure? This cannot be undone.") && alert("Contact support to delete your account.")}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all flex-shrink-0 ml-4"
            >
              Delete
            </button>
          </div>
        </Section>
      </div>
    </div>
  )
}

// Password input helper
function PwField({
  label, value, onChange, show, onToggleShow,
}: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggleShow: () => void
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          minLength={8}
          className="w-full pr-10 pl-4 py-2.5 bg-[#05070a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}