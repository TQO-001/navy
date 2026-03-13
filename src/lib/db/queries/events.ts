import sql from "@/lib/db"

/**
 * Fetches all events associated with a specific application.
 * Results are ordered by date (newest first) to fit the Activity Log timeline.
 */
export async function getEventsByApplicationId(applicationId: string) {
  if (!applicationId) {
    console.warn("getEventsByApplicationId called without applicationId")
    return []
  }

  try {
    const rows = await sql`
      SELECT 
        id, 
        application_id, 
        event_type, 
        title, 
        description, 
        event_date, 
        created_at 
      FROM application_events
      WHERE application_id = ${applicationId}
      ORDER BY event_date DESC, created_at DESC
    `
    return rows
  } catch (error) {
    console.error("Database error fetching events:", error)
    return []
  }
}

/**
 * Fetch a single event by its ID
 */
export async function getEventById(id: string) {
  if (!id) return null

  try {
    const rows = await sql`
      SELECT * FROM application_events 
      WHERE id = ${id} 
      LIMIT 1
    `
    return rows[0] ?? null
  } catch (error) {
    console.error("Database error fetching event by ID:", error)
    return null
  }
}

/**
 * Creates a new event for an application
 */
export async function createEvent(
  applicationId: string,
  data: { 
    event_type: string; 
    title: string; 
    description?: string; 
    event_date?: string 
  }
) {
  if (!applicationId || !data.title) return null

  try {
    const rows = await sql`
      INSERT INTO application_events (
        application_id, 
        event_type, 
        title, 
        description, 
        event_date
      )
      VALUES (
        ${applicationId},
        ${data.event_type || 'note'},
        ${data.title},
        ${data.description ?? null},
        ${data.event_date || new Date().toISOString()}
      )
      RETURNING *
    `
    return rows[0]
  } catch (error) {
    console.error("Database error creating event:", error)
    throw error
  }
}