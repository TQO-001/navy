import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import { CalendarClient } from "./CalendarClient"
import type { Application } from "@/types"

export default async function CalendarPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  // Fetch only apps with dates to optimize performance for the calendar view
  const apps = await sql<Application[]>`
    SELECT 
      id, 
      job_title, 
      company_name, 
      status, 
      application_date, 
      deadline_date, 
      next_follow_up_date
    FROM applications 
    WHERE user_id = ${user.userId}
    AND (
      deadline_date IS NOT NULL OR 
      next_follow_up_date IS NOT NULL OR 
      application_date IS NOT NULL
    )
    ORDER BY COALESCE(deadline_date, next_follow_up_date, application_date) ASC
  `

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Schedule</h1>
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1.5">
            Mission Deadlines & Intel Follow-ups
          </p>
        </header>

        <CalendarClient apps={apps} />
      </div>
    </div>
  )
}