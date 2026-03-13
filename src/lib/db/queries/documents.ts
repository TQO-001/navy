import sql from "@/lib/db"
import type { Document } from "@/types"

export async function getDocumentsByUserId(userId: string): Promise<Document[]> {
  return await sql<Document[]>`
    SELECT * FROM documents 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `.then(r => r)
}

export async function getDocumentsByApplicationId(applicationId: string): Promise<Document[]> {
  return await sql<Document[]>`
    SELECT * FROM documents 
    WHERE application_id = ${applicationId} 
    ORDER BY created_at DESC
  `.then(r => r)
}

export async function createDocument(userId: string, data: Partial<Document>): Promise<Document> {
  const rows = await sql<Document[]>`
    INSERT INTO documents (user_id, application_id, name, file_url, file_type, category)
    VALUES (
      ${userId}, 
      ${data.application_id ?? null}, 
      ${data.name}, 
      ${data.file_url}, 
      ${data.file_type}, 
      ${data.category ?? 'general'}
    )
    RETURNING *
  `.then(r => r)
  return rows[0]
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM documents WHERE id = ${id} AND user_id = ${userId}
  `.then(r => r)
  return (result.count ?? 0) > 0
}