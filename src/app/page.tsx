import Link from "next/link"
import { Anchor } from "lucide-react"

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <div className="inline-flex items-center gap-3 mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center clay"
          style={{ background: "var(--navy-600)", border: "1px solid var(--sky-border)" }}
        >
          <Anchor size={26} style={{ color: "var(--sky)" }} />
        </div>
        <span className="text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Navy
        </span>
      </div>

      <h1 className="text-5xl font-bold mb-5 max-w-lg leading-tight" style={{ color: "var(--text)" }}>
        Your job search,<br />organised.
      </h1>
      <p className="text-lg mb-12 max-w-sm" style={{ color: "var(--muted-2)" }}>
        Track every application — from wishlist to offer — with a Kanban board, calendar, and more.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-7 py-3.5 text-sm font-bold text-black clay-lift clay-sm"
          style={{ background: "var(--amber)" }}
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="px-7 py-3.5 text-sm font-semibold clay-lift clay-sm"
          style={{ background: "var(--surface)", color: "var(--muted-2)", border: "1px solid var(--border-2)" }}
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
