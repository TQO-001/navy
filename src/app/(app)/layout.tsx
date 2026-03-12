import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TopNav } from "@/components/TopNav"
import sql from "@/lib/db"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const rows = await sql`SELECT email FROM users WHERE id = ${user.userId} LIMIT 1`
  const email = rows[0]?.email as string | undefined
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav userName={user.name} userEmail={email} />
      <main style={{ paddingTop: "60px" }}>
        {children}
      </main>
    </div>
  )
}
