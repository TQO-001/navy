import Link from "next/link"
import { Anchor } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center clay-sm"
            style={{ background: "var(--navy-600)", border: "1px solid var(--sky-border)" }}
          >
            <Anchor size={18} style={{ color: "var(--sky)" }} />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text)" }}>Navy</span>
        </Link>
        <p className="text-center text-sm mb-8" style={{ color: "var(--muted-2)" }}>
          Your job search, organised.
        </p>
        {children}
      </div>
    </div>
  )
}
