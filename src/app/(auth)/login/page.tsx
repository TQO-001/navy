"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) { router.push("/dashboard"); router.refresh() }
    else { const d = await res.json(); setError(d.error || "Login failed"); setLoading(false) }
  }

  return (
    <div className="clay-lg p-8" style={{ background: "var(--surface)" }}>
      <h1 className="text-xl font-bold mb-6" style={{ color: "var(--text)" }}>Welcome back</h1>

      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {([["Email","email","email"],["Password","password","password"]] as [string,string,string][]).map(([l,k,t]) => (
          <div key={k}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>{l}</label>
            <input
              type={t}
              value={(form as Record<string,string>)[k]}
              onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 text-sm focus:outline-none clay-input"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border-2)", color: "var(--text)" }}
            />
          </div>
        ))}
        <button
          type="submit" disabled={loading}
          className="w-full py-3 text-sm font-bold text-black disabled:opacity-60 clay-lift clay-sm mt-2"
          style={{ background: "var(--amber)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
        No account?{" "}
        <Link href="/register" style={{ color: "var(--amber)", fontWeight: 600 }}>Sign up</Link>
      </p>
    </div>
  )
}
