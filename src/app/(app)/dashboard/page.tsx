import { getAuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { getDashboardStats } from "@/lib/db/queries/applications"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Briefcase,
  TrendingUp,
  Star,
  Award,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  LayoutDashboard,
} from "lucide-react"

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const stats = await getDashboardStats(user.userId)

  const cards = [
    {
      label: "Total applications",
      value: stats.total || 0,
      icon: Briefcase,
      href: "/applications",
      color: "text-[#94DEFF]",
      glow: "from-[#94DEFF]/15 to-[#94DEFF]/5",
      border: "hover:border-[#94DEFF]/30",
      iconContainer: "from-[#94DEFF]/20 to-[#94DEFF]/5",
      iconBorder: "border-[#94DEFF]/25",
      valueTint: "from-[#94DEFF] to-white",
    },
    {
      label: "Active pipeline",
      value: stats.active || 0,
      icon: TrendingUp,
      href: "/applications",
      color: "text-blue-400",
      glow: "from-blue-600/20 to-blue-600/5",
      border: "hover:border-blue-500/40",
      iconContainer: "from-blue-600/30 to-blue-600/10",
      iconBorder: "border-blue-500/30",
      valueTint: "from-blue-300 to-white",
    },
    {
      label: "Response rate",
      value: stats.response_rate ? `${stats.response_rate}%` : "0%",
      icon: Star,
      href: "/applications",
      // pink accent for engagement metrics
      color: "text-[#FF277F]",
      glow: "from-[#FF277F]/20 to-[#FF277F]/5",
      border: "hover:border-[#FF277F]/40",
      iconContainer: "from-[#FF277F]/25 to-[#FF277F]/8",
      iconBorder: "border-[#FF277F]/30",
      valueTint: "from-[#FF277F] to-rose-200",
    },
    {
      label: "Offer rate",
      value: stats.offer_rate ? `${stats.offer_rate}%` : "0%",
      icon: Award,
      href: "/applications?status=offer",
      // pink accent — highest-impact metric
      color: "text-[#FF277F]",
      glow: "from-[#FF277F]/20 to-[#FF277F]/5",
      border: "hover:border-[#FF277F]/40",
      iconContainer: "from-[#FF277F]/25 to-[#FF277F]/8",
      iconBorder: "border-[#FF277F]/30",
      valueTint: "from-[#FF277F] to-pink-200",
    },
  ]

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans antialiased selection:bg-[#FF277F]/20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#FF277F]/6 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#94DEFF]/4 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* ── Header ── */}
        <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">
                {greeting},{" "}
                <span
                  className="bg-gradient-to-r from-[#94DEFF] via-blue-400 to-white bg-clip-text text-transparent"
                >
                  {user.name?.split(" ")[0] || "Commander"}
                </span>
              </h1>
              <div className="text-3xl animate-in zoom-in duration-500 delay-300">⚓</div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`relative group overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.07] ${card.border} hover:shadow-2xl hover:-translate-y-1`}
            >
              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`p-3 bg-gradient-to-br ${card.iconContainer} rounded-xl border ${card.iconBorder} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className={card.color} size={22} />
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]">
                    Metric
                  </span>
                </div>

                <div className="space-y-1">
                  <p
                    className={`text-4xl font-bold tracking-tight bg-gradient-to-br ${card.valueTint} bg-clip-text text-transparent`}
                  >
                    {card.value}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    {card.label}
                  </p>
                </div>
              </div>

              {/* Decorative glow */}
              <div
                className={`absolute -right-6 -bottom-6 w-28 h-28 bg-gradient-to-br ${card.glow} blur-[50px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
              />
            </Link>
          ))}
        </div>

        {/* ── Action Bar ── */}
        <div className="flex flex-wrap gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* Primary blue CTA */}
          <Link
            href="/applications/new"
            className="group relative flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all active:scale-95 border overflow-hidden btn-blue-sky"
            style={{ borderColor: "rgba(148,222,255,0.2)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">New Application</span>
          </Link>

          {/* Secondary pink CTA */}
          <Link
            href="/applications"
            className="group flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl border transition-all active:scale-95 btn-pink"
            style={{ borderColor: "rgba(255,39,127,0.3)" }}
          >
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            View Board
          </Link>

          <div
            className="ml-auto flex items-center gap-3 px-4 py-2 rounded-xl border"
            style={{
              background: "rgba(148,222,255,0.04)",
              borderColor: "rgba(148,222,255,0.12)",
            }}
          >
            <Clock size={14} style={{ color: "#94DEFF", opacity: 0.6 }} />
            <span className="text-xs font-medium" style={{ color: "#94DEFF", opacity: 0.7 }}>
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ── Quick Access ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              href: "/applications",
              label: "Job Board",
              sub: "Manage your pipeline",
              colorClass: "hover:border-[#94DEFF]/25",
              iconColor: "text-[#94DEFF]/50",
            },
            {
              href: "/calendar",
              label: "Calendar",
              sub: "Upcoming interviews",
              colorClass: "hover:border-[#FF277F]/25",
              iconColor: "text-[#FF277F]/50",
            },
            {
              href: "/documents",
              label: "Documents",
              sub: "Resumes & Cover letters",
              colorClass: "hover:border-[#94DEFF]/25",
              iconColor: "text-[#94DEFF]/50",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300",
                item.colorClass // Use Tailwind classes for hover borders instead of JS events
              )}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
                <ArrowRight
                  size={18}
                  className={cn("group-hover:translate-x-1 transition-all", item.iconColor)}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Pipeline Stats Row ── */}
        {stats.total > 0 && (
          <div
            className="rounded-2xl p-6 border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Pipeline Breakdown
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Wishlist + Applied", value: (stats.active - stats.interviews) || 0, color: "#94DEFF" },
                { label: "Interviews", value: stats.interviews || 0, color: "#FF277F" },
                { label: "Offers", value: stats.offers || 0, color: "#FF277F" },
                { label: "Response Rate", value: `${stats.response_rate || 0}%`, color: "#94DEFF" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 p-4 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}