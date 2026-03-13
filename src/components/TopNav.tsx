'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Anchor,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from "./ThemeProvider";

interface TopNavProps {
  user: { name: string; email: string };
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Job Board', icon: Briefcase },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export default function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    router.push('/login');
    router.refresh();
  }

  const isActive = (href: string) => 
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="bg-[#05070a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
               <Image 
                src="/logo.png" 
                alt="Navy Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white uppercase group-hover:text-purple-400 transition-colors">
              Navy
            </span>
          </Link>

          {/* Desktop Navigation - Slim Typography */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Actions Section */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <span className="text-[12px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              {user.name.toLowerCase().replace(' ', '.')}
            </span>

            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              Sign out
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Glassmorphism */}
      {mobileOpen && (
        <div className="md:hidden bg-[#05070a] border-t border-white/5 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(href)
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          
          <div className="pt-4 mt-2 border-t border-white/5 space-y-2">
             <button
              onClick={toggle}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              Theme
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-400/10 transition-colors"
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