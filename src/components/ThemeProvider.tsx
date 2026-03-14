"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeCtxValue {
  theme: Theme
  toggle: () => void
  mounted: boolean
}

const ThemeCtx = createContext<ThemeCtxValue>({
  theme: "dark",
  toggle: () => {},
  mounted: false,
})

// ─────────────────────────────────────────────────────────────────────────────
// HYDRATION FIX: React 19 / Next.js 16 is strict about SSR↔CSR text mismatches.
// The original provider read localStorage inside useEffect but the html element
// had no initial class, causing a visible flash and React hydration warnings.
//
// Fix strategy:
//  1. Always render with `dark` on the server (matches the body background #05070a)
//  2. After mount, read localStorage and reconcile — this is a single silent repaint
//  3. Expose `mounted` so children can defer theme-dependent rendering if needed
//  4. Apply the theme via `data-theme` attribute AND the `dark` class so both
//     CSS variable strategies and Tailwind `dark:` variants work simultaneously
// ─────────────────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? "dark"
    setTheme(saved)
    applyTheme(saved)
    setMounted(true)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    root.setAttribute("data-theme", t)
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    applyTheme(next)
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle, mounted }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeCtx)
}