import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import TopNav from "@/components/TopNav"
import sql from "@/lib/db"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  const rows = await sql`SELECT email FROM users WHERE id = ${user.userId} LIMIT 1`
  const email = rows[0]?.email as string || ""

  return (
    // Changed min-h-screen and flex-col to manage space better
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <TopNav user={{ name: user.name, email: email }} />
      
      {/* Removed: style={{ paddingTop: "60px" }} 
          Added: flex-1 to fill remaining height
      */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}