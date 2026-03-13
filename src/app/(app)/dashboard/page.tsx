import { getAuthUser } from "@/lib/auth"
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
  Zap, 
  Globe,
  LayoutDashboard
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
      color: "text-blue-400",
      glow: "from-blue-600/20 to-blue-600/5",
      border: "hover:border-blue-500/40",
      iconContainer: "from-blue-600/30 to-blue-600/10",
      iconBorder: "border-blue-500/30"
    },
    {
      label: "Active pipeline",
      value: stats.active || 0,
      icon: TrendingUp,
      href: "/applications",
      color: "text-sky-400",
      glow: "from-sky-600/20 to-sky-600/5",
      border: "hover:border-sky-500/40",
      iconContainer: "from-sky-600/30 to-sky-600/10",
      iconBorder: "border-sky-500/30"
    },
    {
      label: "Response rate",
      value: stats.response_rate ? `${stats.response_rate}%` : "0%",
      icon: Star,
      href: "/applications",
      color: "text-indigo-400",
      glow: "from-indigo-600/20 to-indigo-600/5",
      border: "hover:border-indigo-500/40",
      iconContainer: "from-indigo-600/30 to-indigo-600/10",
      iconBorder: "border-indigo-500/30"
    },
    {
      label: "Offer rate",
      value: stats.offer_rate ? `${stats.offer_rate}%` : "0%",
      icon: Award,
      href: "/applications?status=offer",
      color: "text-emerald-400",
      glow: "from-emerald-600/20 to-emerald-600/5",
      border: "hover:border-emerald-500/40",
      iconContainer: "from-emerald-600/30 to-emerald-600/10",
      iconBorder: "border-emerald-500/30"
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="min-h-screen bg-[#06080f] text-white font-sans antialiased selection:bg-blue-500/30">
      {/* Ambient Background Effects (Navy Theme) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">
                {greeting}, <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-slate-300 bg-clip-text text-transparent">{user.name?.split(" ")[0] || "User"}</span>
              </h1>
              <div className="text-3xl animate-in zoom-in duration-500 delay-300">⚓</div>
            </div>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              Commander, your dashboard is ready
              <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Live Tracking
              </span>
            </p>
          </div>
        </div>

        {/* Stats Grid - Glassmorphism style from reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`relative group overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.08] ${card.border} hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1`}
            >
              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-3 bg-gradient-to-br ${card.iconContainer} rounded-xl border ${card.iconBorder} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={card.color} size={24} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Metrics
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    {card.label}
                  </p>
                </div>
              </div>

              {/* Decorative Background Glows */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${card.glow} blur-[40px] rounded-full group-hover:opacity-100 transition-all duration-500`} />
            </Link>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href="/applications/new"
            className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-blue-900/30 active:scale-95 border border-blue-400/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">New Application</span>
          </Link>
          
          <Link
            href="/applications"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            View Board
          </Link>

          <div className="ml-auto flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access / Content Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Sparkles className="text-blue-400" size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Quick Access
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/applications"
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Job Board</h3>
                  <p className="text-xs text-slate-500">Manage your pipeline</p>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link 
              href="/calendar"
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Calendar</h3>
                  <p className="text-xs text-slate-500">Upcoming interviews</p>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link 
              href="/documents"
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Documents</h3>
                  <p className="text-xs text-slate-500">Resumes & Cover letters</p>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}