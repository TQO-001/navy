import { getAuthUser } from "@/lib/auth"
import { getDashboardStats } from "@/lib/db/queries/applications"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Briefcase, TrendingUp, Star, Award, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const stats = await getDashboardStats(user.userId)

  const cards = [
    { label: "Total applications", value: stats.total || 0,  icon: Briefcase,  href: "/applications",           color: "#f59e0b", glow: "rgba(245,158,11,0.14)" },
    { label: "Active pipeline",    value: stats.active || 0, icon: TrendingUp, href: "/applications",            color: "#38bdf8", glow: "rgba(56,189,248,0.14)" },
    { label: "Response rate",      value: `${stats.response_rate ?? 0}%`, icon: Star,    href: "/applications",  color: "#c4b5fd", glow: "rgba(196,181,253,0.14)" },
    { label: "Offer rate",         value: `${stats.offer_rate ?? 0}%`,    icon: Award,   href: "/applications?status=offer", color: "#34d399", glow: "rgba(52,211,153,0.14)" },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const emoji    = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙"

  const quickLinks = [
    { href: "/applications",     label: "Open Job Board", primary: true },
    { href: "/calendar",         label: "Calendar",       primary: false },
    { href: "/documents",        label: "Documents",      primary: false },
  ]

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-card {
          display: block;
          background: var(--surface);
          border-radius: 22px;
          padding: 1.5rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: var(--clay);
          border: 1px solid var(--border);
        }
        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--clay-hover);
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: var(--text);
          margin-bottom: 0.25rem;
        }
        .stat-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .icon-wrapper {
          width: 3rem;
          height: 3rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: var(--clay-sm);
        }
        .quick-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 14px;
          text-decoration: none;
          transition: transform 0.2s ease;
          box-shadow: var(--clay-sm);
        }
        .quick-link:hover { transform: translateY(-2px); }
        .quick-link-primary { background: var(--amber); color: #000; }
        .quick-link-secondary {
          background: var(--surface-2);
          color: var(--muted-2);
          border: 1px solid var(--border-2);
        }
        .grid-2x2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
      `}} />

      <div className="mx-auto px-8 py-10" style={{ maxWidth: "1040px" }}>
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {greeting}, {user.name?.split(" ")[0] || "User"} {emoji}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted-2)" }}>
            Here's your job search at a glance.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid-2x2">
          {cards.map((card, index) => (
            <Link key={index} href={card.href} className="dashboard-card">
              <div className="icon-wrapper" style={{ background: card.glow, color: card.color }}>
                <card.icon size={22} />
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick access */}
        <div className="clay p-6" style={{ background: "var(--surface)", borderRadius: "22px", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Quick access</h2>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`quick-link ${link.primary ? "quick-link-primary" : "quick-link-secondary"}`}
              >
                {link.label}
                {link.primary && <ArrowRight size={13} />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
