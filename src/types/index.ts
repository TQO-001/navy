// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts  —  Navy canonical type definitions
// ─────────────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "ghosted"

export type ApplicationPriority = "low" | "medium" | "high"
export type WorkType = "onsite" | "remote" | "hybrid"

// ── Document category enum ────────────────────────────────────────────────────
export type DocumentCategory = "resume" | "cover_letter" | "certificate" | "other"

// ─────────────────────────────────────────────────────────────────────────────
// ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface JWTPayload {
  userId: string
  name: string
  email: string
}

export interface Application {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_url?: string
  status: ApplicationStatus
  priority?: ApplicationPriority
  work_type?: WorkType
  location?: string
  salary_min?: number
  salary_max?: number
  application_date?: string
  source?: string
  excitement_level?: number
  notes?: string
  job_description?: string
  deadline_date?: string
  next_follow_up_date?: string
  created_at: string
  updated_at: string
  events?: ApplicationEvent[]
}

export interface ApplicationEvent {
  id: string
  application_id: string
  event_type: string
  title: string
  description?: string
  event_date: string
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  linkedin_url?: string
  notes?: string
  created_at: string
}

// ── Document (Vault) ──────────────────────────────────────────────────────────
// Aligned with migration 005.
// Legacy DB columns (doc_type, storage_path, is_link, url) remain in the
// database but are not reflected here; migration 005 backfills the new columns.
export interface Document {
  /** UUID primary key */
  id: string
  /** Owner user UUID */
  user_id: string
  /** Optional FK to a specific job application */
  application_id: string | null
  /** Human-readable filename, e.g. "Resume_2026.pdf" */
  name: string
  /**
   * Canonical file URL.
   * • Uploaded files:  server-relative path, served via /api/documents/[id]/file
   * • External links:  full https:// URL
   * • null when record was created before this column existed
   */
  file_url: string | null
  /** MIME type string, e.g. "application/pdf" or "image/png" */
  file_type: string | null
  /** High-level UI grouping */
  category: DocumentCategory
  /** ISO-8601 creation timestamp */
  created_at: string
}

// ── Mutation input ────────────────────────────────────────────────────────────
export interface CreateDocumentInput {
  user_id: string
  application_id?: string | null
  name: string
  file_url: string | null
  file_type: string | null
  category: DocumentCategory
}

export interface DashboardStats {
  total: number
  active: number
  interviews: number
  offers: number
  response_rate: number
  offer_rate: number
}

export interface CreateApplicationRequest {
  company_name: string
  job_title: string
  job_url?: string
  status: ApplicationStatus
  priority?: ApplicationPriority
  work_type?: WorkType
  location?: string
  salary_min?: number
  salary_max?: number
  application_date?: string
  source?: string
  excitement_level?: number
  notes?: string
  job_description?: string
  deadline_date?: string
  next_follow_up_date?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// UI CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist:     "Wishlist",
  applied:      "Applied",
  phone_screen: "Phone Screen",
  interview:    "Interview",
  offer:        "Offer",
  rejected:     "Rejected",
  withdrawn:    "Withdrawn",
  ghosted:      "Ghosted",
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  wishlist:     "zinc",
  applied:      "blue",
  phone_screen: "amber",
  interview:    "purple",
  offer:        "green",
  rejected:     "red",
  withdrawn:    "orange",
  ghosted:      "slate",
}

export const STATUS_ORDER: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "ghosted",
]

export const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  low:    { bg: "rgba(100,116,139,.12)", color: "#94a3b8" },
  medium: { bg: "rgba(245,158,11,.12)",  color: "#fbbf24" },
  high:   { bg: "rgba(239,68,68,.12)",   color: "#f87171" },
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  resume:       "Resume / CV",
  cover_letter: "Cover Letter",
  certificate:  "Certificate",
  other:        "Other",
}

export const CATEGORY_ORDER: DocumentCategory[] = [
  "resume",
  "cover_letter",
  "certificate",
  "other",
]