import sql from "@/lib/db"
import type { Document } from "@/types"

/**
 * We define a local interface for the DB input because the global 
 * 'Document' type is missing required properties like file_url, name, etc.
 */
interface CreateDocumentInput {
  application_id?: string | null;
  name: string;
  file_url: string;
  file_type: string;
  category?: string;
}

export async function getDocumentsByUserId(userId: string): Promise<Document[]> {
  // Use 'any' for the internal query to prevent property errors if 'Document' is empty
  const rows = await sql<any[]>`
    SELECT * FROM documents 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
  return rows as Document[];
}

export async function getDocumentsByApplicationId(applicationId: string): Promise<Document[]> {
  const rows = await sql<any[]>`
    SELECT * FROM documents 
    WHERE application_id = ${applicationId} 
    ORDER BY created_at DESC
  `
  return rows as Document[];
}

export async function createDocument(userId: string, data: CreateDocumentInput): Promise<Document> {
  const rows = await sql<any[]>`
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
  `
  return rows[0] as Document;
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM documents WHERE id = ${id} AND user_id = ${userId}
  `
  return (result.count ?? 0) > 0
}