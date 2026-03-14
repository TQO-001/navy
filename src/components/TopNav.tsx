'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, FileText, Users, Calendar,
  LogOut, Menu, X, Sun, Moon, UserCircle,
} from 'lucide-react';
import { useTheme } from "./ThemeProvider";

interface TopNavProps {
  user: { name: string; email: string };
}

const navLinks = [
  { href: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Job Board',  icon: Briefcase },
  { href: '/documents',    label: 'Documents',  icon: FileText },
  { href: '/contacts',     label: 'Contacts',   icon: Users },
  { href: '/calendar',     label: 'Calendar',   icon: Calendar },
];

export default function TopNav({ user }: TopNavProps) {
  const router     = useRouter();
  const pathname   = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    router.push('/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: "rgba(5,7,10,0.85)", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
              <Image src="/logo.png" alt="Navy Logo" fill className="object-contain" />
            </div>
            <span
              className="text-xl font-semibold tracking-tight text-white uppercase transition-all"
              style={{ textShadow: "0 0 20px rgba(148,222,255,0)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textShadow = "0 0 20px rgba(148,222,255,0.45)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textShadow = "0 0 20px rgba(148,222,255,0)" }}
            >
              Navy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all border"
                  style={
                    active
                      ? {
                          background: "rgba(148,222,255,0.07)",
                          borderColor: "rgba(148,222,255,0.22)",
                          color: "#94DEFF",
                          boxShadow: "0 0 12px rgba(148,222,255,0.15)",
                        }
                      : {
                          background: "transparent",
                          borderColor: "transparent",
                          color: "#9ca3af",
                        }
                  }
                  onMouseEnter={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = "rgba(255,255,255,0.04)"
                      el.style.color = "#e5e7eb"
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = "transparent"
                      el.style.color = "#9ca3af"
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              title="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-[#94DEFF] hover:bg-[#94DEFF]/5 border border-transparent hover:border-[#94DEFF]/15 transition-all"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            {/* Profile link with sky glow when active */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
              style={
                isActive('/profile')
                  ? {
                      background: "rgba(148,222,255,0.07)",
                      borderColor: "rgba(148,222,255,0.22)",
                      color: "#94DEFF",
                      boxShadow: "0 0 10px rgba(148,222,255,0.12)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "#9ca3af",
                    }
              }
            >
              <UserCircle size={15} />
              <span className="font-mono">
                {user.name.toLowerCase().replace(' ', '.')}
              </span>
            </Link>

            {/* Sign out — pink hover */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 text-[13px] font-semibold text-gray-500 transition-colors"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#FF277F" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280" }}
            >
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Sign out
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-1.5 animate-in slide-in-from-top-2 duration-200"
          style={{ background: "#05070a", borderColor: "rgba(255,255,255,0.05)" }}
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border"
              style={
                isActive(href)
                  ? {
                      background: "rgba(148,222,255,0.07)",
                      borderColor: "rgba(148,222,255,0.18)",
                      color: "#94DEFF",
                    }
                  : {
                      background: "transparent",
                      borderColor: "transparent",
                      color: "#9ca3af",
                    }
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t space-y-1.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all"
              style={
                isActive('/profile')
                  ? { background: "rgba(148,222,255,0.07)", borderColor: "rgba(148,222,255,0.18)", color: "#94DEFF" }
                  : { background: "transparent", borderColor: "transparent", color: "#9ca3af" }
              }
            >
              <UserCircle size={18} />
              Profile & Settings
            </Link>
            <button
              onClick={toggle}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 border border-transparent"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border border-transparent transition-colors"
              style={{ color: "#FF277F" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,39,127,0.07)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}