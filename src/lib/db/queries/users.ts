import sql from "@/lib/db"
import type { User } from "@/types"

export async function getUserById(id: string): Promise<User | null> {
  const rows = await sql<User[]>`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ?? null
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const rows = await sql<(User & { password_hash: string })[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1`
  return rows[0] ?? null
}

export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  const rows = await sql<User[]>`
    INSERT INTO users (email, name, password_hash)
    VALUES (${email}, ${name}, ${passwordHash})
    RETURNING *`
  return rows[0]
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string }>
): Promise<User | null> {
  const rows = await sql<User[]>`
    UPDATE users
    SET name = COALESCE(${data.name ?? null}, name),
        email = COALESCE(${data.email ?? null}, email),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *`
  return rows[0] ?? null
}
