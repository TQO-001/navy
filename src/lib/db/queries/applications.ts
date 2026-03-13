import sql from "@/lib/db"
import type { Application, CreateApplicationRequest, Document } from "@/types"

/**
 * FETCHING LOGIC
 */

export async function getApplicationsByUserId(userId: string): Promise<Application[]> {
  if (!userId) return []
  
  return await sql<Application[]>`
    SELECT * FROM applications 
    WHERE user_id = ${userId} 
    ORDER BY updated_at DESC
  `
}

export async function getApplicationById(
  id: string,
  userId: string
): Promise<Application | null> {
  // Guard clause to prevent UNDEFINED_VALUE runtime errors
  if (!id || !userId) {
    console.warn("getApplicationById called with missing parameters:", { id, userId })
    return null
  }

  const rows = await sql<Application[]>`
    SELECT * FROM applications 
    WHERE id = ${id} AND user_id = ${userId} 
    LIMIT 1
  `

  if (!rows.length) return null
  const app = rows[0]

  const events = await sql<any[]>`
    SELECT * FROM application_events
    WHERE application_id = ${id}
    ORDER BY event_date DESC, created_at DESC
  `

  return { ...app, events: events as unknown as Application["events"] }
}

/**
 * MUTATION LOGIC
 */

export async function createApplication(
  userId: string,
  data: CreateApplicationRequest
): Promise<Application> {
  if (!userId) throw new Error("User ID is required to create an application")

  // Helper to ensure empty strings or bad dates don't crash the query
  const formatDBDate = (dateVal: any) => {
    if (!dateVal || dateVal === "") return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const rows = await sql<Application[]>`
    INSERT INTO applications (
      user_id, company_name, job_title, job_url, status, priority,
      work_type, location, salary_min, salary_max, application_date,
      source, excitement_level, notes, job_description, deadline_date, next_follow_up_date
    )
    VALUES (
      ${userId},
      ${data.company_name},
      ${data.job_title},
      ${data.job_url || null},
      ${data.status || "wishlist"},
      ${data.priority || "medium"},
      ${data.work_type || null},
      ${data.location || null},
      ${data.salary_min || null},
      ${data.salary_max || null},
      ${formatDBDate(data.application_date)},
      ${data.source || null},
      ${data.excitement_level || null},
      ${data.notes || null},
      ${data.job_description || null},
      ${formatDBDate(data.deadline_date)},
      ${formatDBDate(data.next_follow_up_date)}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateApplication(
  id: string,
  userId: string,
  data: Partial<CreateApplicationRequest>
): Promise<Application | null> {
  if (!id || !userId) return null

  const currentRows = await sql<any[]>`
    SELECT * FROM applications WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `
  if (!currentRows.length) return null
  const c = currentRows[0]

  const rows = await sql<Application[]>`
    UPDATE applications SET
      company_name        = ${data.company_name ?? c.company_name},
      job_title           = ${data.job_title ?? c.job_title},
      job_url             = ${data.job_url !== undefined ? data.job_url : (c.job_url ?? null)},
      status              = ${data.status ?? c.status},
      priority            = ${data.priority ?? c.priority ?? "medium"},
      work_type           = ${data.work_type !== undefined ? data.work_type : (c.work_type ?? null)},
      location            = ${data.location !== undefined ? data.location : (c.location ?? null)},
      salary_min          = ${data.salary_min !== undefined ? data.salary_min : (c.salary_min ?? null)},
      salary_max          = ${data.salary_max !== undefined ? data.salary_max : (c.salary_max ?? null)},
      application_date    = ${data.application_date !== undefined ? data.application_date : (c.application_date ?? null)},
      source              = ${data.source !== undefined ? data.source : (c.source ?? null)},
      excitement_level    = ${data.excitement_level !== undefined ? data.excitement_level : (c.excitement_level ?? null)},
      notes               = ${data.notes !== undefined ? data.notes : (c.notes ?? null)},
      job_description     = ${data.job_description !== undefined ? data.job_description : (c.job_description ?? null)},
      deadline_date       = ${data.deadline_date !== undefined ? data.deadline_date : (c.deadline_date ?? null)},
      next_follow_up_date = ${data.next_follow_up_date !== undefined ? data.next_follow_up_date : (c.next_follow_up_date ?? null)},
      updated_at          = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `

  return rows[0] ?? null
}

export async function deleteApplication(id: string, userId: string): Promise<boolean> {
  if (!id || !userId) return false
  const result = await sql`
    DELETE FROM applications WHERE id = ${id} AND user_id = ${userId}
  `
  return (result.count ?? 0) > 0
}

export async function createEvent(
  applicationId: string,
  data: { event_type: string; title: string; description?: string; event_date?: string }
) {
  if (!applicationId) return null
  const rows = await sql<any[]>`
    INSERT INTO application_events (application_id, event_type, title, description, event_date)
    VALUES (
      ${applicationId},
      ${data.event_type ?? "note"},
      ${data.title},
      ${data.description ?? null},
      ${data.event_date ?? new Date().toISOString()}
    )
    RETURNING *
  `
  return rows[0]
}

export async function getDashboardStats(userId: string) {
  if (!userId) return { total: 0, active: 0, interviews: 0, offers: 0, response_rate: 0, offer_rate: 0 }

  const apps = await sql<any[]>`
    SELECT status FROM applications WHERE user_id = ${userId}
  `

  const total      = apps.length
  const active     = apps.filter((a: any) => !["rejected","withdrawn","ghosted"].includes(a.status)).length
  const interviews = apps.filter((a: any) => a.status === "interview").length
  const offers     = apps.filter((a: any) => a.status === "offer").length
  const applied    = apps.filter((a: any) => a.status !== "wishlist").length

  const response_rate = applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0
  const offer_rate    = applied > 0 ? Math.round((offers / applied) * 100) : 0

  return { total, active, interviews, offers, response_rate, offer_rate }
}

export async function getDocumentsByApplicationId(applicationId: string): Promise<Document[]> {
  if (!applicationId) return []
  return await sql<Document[]>`
    SELECT * FROM documents 
    WHERE application_id = ${applicationId} 
    ORDER BY created_at DESC
  `
}