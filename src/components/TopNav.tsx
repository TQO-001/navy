"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sun, Moon, Search, Bell, LayoutDashboard, Briefcase, FileText, Users, Calendar, Menu, X, User, LogOut, Anchor } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Job Board", icon: Briefcase },
  { href: "/documents",    label: "Documents", icon: FileText },
  { href: "/contacts",     label: "Contacts",  icon: Users },
  { href: "/calendar",     label: "Calendar",  icon: Calendar },
]

export function TopNav({ userName, userEmail }: { userName: string; userEmail?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { theme, toggle } = useTheme()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const initials = userName.split(" ").map(n => n[0] ?? "").join("").toUpperCase().slice(0, 2)

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login"); router.refresh()
  }

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      <nav className="topnav px-6 gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center clay-sm"
            style={{ background: "var(--navy-600)", border: "1px solid var(--sky-border)" }}
          >
            <Anchor size={15} style={{ color: "var(--sky)" }} />
          </div>
          <span className="font-bold text-base hide-mobile" style={{ color: "var(--text)" }}>Navy</span>
        </Link>

        {/* Nav links */}
        <div className="topnav-links flex items-center gap-1 flex-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={`topnav-link ${isActive(href) ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative hide-mobile">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
            <input
              placeholder="Search anything"
              className="pl-9 pr-4 py-1.5 text-sm w-44 focus:outline-none transition-all focus:w-60 clay-input"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border-2)", color: "var(--text)" }}
            />
          </div>

          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "var(--muted-2)" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="w-8 h-8 flex items-center justify-center rounded-xl hide-mobile"
            style={{ color: "var(--muted-2)" }}
          >
            <Bell size={16} />
          </button>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black clay-sm"
              style={{ background: "var(--amber)" }}
            >
              {initials}
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 z-50 py-1 clay"
                style={{ background: "var(--surface-3)" }}
              >
                <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{userName}</p>
                  {userEmail && <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{userEmail}</p>}
                </div>
                <Link
                  href="/profile" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                  style={{ color: "var(--muted-2)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,120,220,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <User size={14} /> Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                  style={{ color: "#f87171" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="mobile-menu-btn w-8 h-8 items-center justify-center rounded-xl"
            style={{ color: "var(--muted-2)" }}
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-64 h-full flex flex-col py-4 px-3 space-y-1 clay-lg"
            style={{ background: "var(--surface)" }}
          >
            <div
              className="flex items-center justify-between px-3 pb-3 mb-1"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center clay-sm"
                  style={{ background: "var(--navy-600)", border: "1px solid var(--sky-border)" }}
                >
                  <Anchor size={13} style={{ color: "var(--sky)" }} />
                </div>
                <span className="font-bold" style={{ color: "var(--text)" }}>Navy</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--muted)" }}>
                <X size={18} />
              </button>
            </div>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive(href) ? "var(--amber-dim)" : "transparent",
                  color: isActive(href) ? "var(--amber)" : "var(--muted-2)",
                  boxShadow: isActive(href) ? "var(--clay-sm)" : "none",
                }}
              >
                <Icon size={15} style={{ color: isActive(href) ? "var(--amber)" : "var(--muted)" }} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
