import { getAuthUser } from "@/lib/auth"
import { getApplicationsByUserId } from "@/lib/db/queries/applications"
import { redirect } from "next/navigation"
import type { ApplicationStatus } from "@/types"
import { STATUS_ORDER } from "@/types"
import { ApplicationsView } from "./ApplicationsView"

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; view?: string }>
}) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  // Next.js 15+ requires awaiting searchParams
  const resolvedSearchParams = await searchParams
  const filterStatus = resolvedSearchParams.status
  const q = resolvedSearchParams.q
  const view = resolvedSearchParams.view

  const allApps = await getApplicationsByUserId(user.userId)
  
  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = allApps.filter(a => a.status === s).length
    return acc
  }, {} as Record<ApplicationStatus, number>)

  const filtered = allApps.filter(app => {
    if (filterStatus && app.status !== filterStatus) return false
    if (q) {
      const query = q.toLowerCase()
      return (
        app.job_title.toLowerCase().includes(query) ||
        app.company_name.toLowerCase().includes(query) ||
        (app.location ?? "").toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <ApplicationsView
      allApps={allApps}
      filtered={filtered}
      counts={counts}
      filterStatus={filterStatus}
      searchQuery={q}
      initialView={(view as "table" | "list" | "kanban") || "kanban"}
    />
  )
}