import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import { CalendarClient } from "./CalendarClient"
import type { Application } from "@/types"

export default async function CalendarPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  // ─────────────────────────────────────────────────────────────────────────
  // BUG FIX: The `postgres` driver returns PostgreSQL DATE columns as
  // JavaScript Date objects, NOT strings. When these are serialised through
  // the Next.js RSC boundary into a Client Component, React 19 serialises
  // Date objects as ISO strings — BUT the hydrated value on the client is
  // still a Date object at runtime if the component doesn't await the prop.
  //
  // The CalendarClient calls .startsWith() on these values:
  //   app.application_date.startsWith(dStr)  → TypeError: not a function
  //
  // FIX: Explicitly cast each date column to TEXT in the SQL query.
  // This guarantees the driver returns plain "YYYY-MM-DD" strings, which
  // is what the client code expects.
  // ─────────────────────────────────────────────────────────────────────────
  const apps = await sql<Application[]>`
    SELECT
      id,
      job_title,
      company_name,
      status,
      application_date::text        AS application_date,
      deadline_date::text           AS deadline_date,
      next_follow_up_date::text     AS next_follow_up_date
    FROM applications
    WHERE user_id = ${user.userId}
    AND (
      deadline_date       IS NOT NULL OR
      next_follow_up_date IS NOT NULL OR
      application_date    IS NOT NULL
    )
    ORDER BY COALESCE(deadline_date, next_follow_up_date, application_date) ASC
  `

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Schedule</h1>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5"
            style={{ color: "#94DEFF", opacity: 0.8 }}
          >
            Mission Deadlines & Intel Follow-ups
          </p>
        </header>

        <CalendarClient apps={apps} />
      </div>
    </div>
  )
}