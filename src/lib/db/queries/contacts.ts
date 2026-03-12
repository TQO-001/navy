import sql from "@/lib/db"
import type { Contact } from "@/types"

export async function getContactsByUserId(userId: string): Promise<Contact[]> {
  return sql<Contact[]>`
    SELECT id, user_id, name, email, phone, company, role, linkedin_url, notes, created_at
    FROM contacts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
}

export async function createContact(userId: string, data: Partial<Contact>): Promise<Contact> {
  const rows = await sql<Contact[]>`
    INSERT INTO contacts (user_id, name, email, phone, company, role, linkedin_url, notes)
    VALUES (
      ${userId},
      ${data.name!},
      ${data.email ?? null},
      ${data.phone ?? null},
      ${data.company ?? null},
      ${data.role ?? null},
      ${data.linkedin_url ?? null},
      ${data.notes ?? null}
    )
    RETURNING id, user_id, name, email, phone, company, role, linkedin_url, notes, created_at
  `
  return rows[0]
}

export async function deleteContact(id: string, userId: string): Promise<boolean> {
  const r = await sql`DELETE FROM contacts WHERE id = ${id} AND user_id = ${userId}`
  return (r.count ?? 0) > 0
}
