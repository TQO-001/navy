import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import { CalendarClient } from "./CalendarClient"
import type { Application } from "@/types"

export default async function CalendarPage() {
  const user = await getAuthUser()
  if (!user) redirect("/login")
  const apps = await sql<Application[]>`
    SELECT id, job_title, company_name, status, application_date, deadline_date, next_follow_up_date
    FROM applications WHERE user_id = ${user.userId}
    AND (deadline_date IS NOT NULL OR next_follow_up_date IS NOT NULL OR application_date IS NOT NULL)
    ORDER BY COALESCE(deadline_date, next_follow_up_date, application_date)`
  return <CalendarClient apps={apps} />
}
