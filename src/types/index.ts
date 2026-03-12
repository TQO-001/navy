export type ApplicationStatus = "wishlist" | "applied" | "phone_screen" | "interview" | "offer" | "rejected" | "withdrawn" | "ghosted"
export type ApplicationPriority = "low" | "medium" | "high"
export type WorkType = "onsite" | "remote" | "hybrid"

export interface User { id: string; email: string; name: string; created_at: string }
export interface JWTPayload { userId: string; name: string; email: string }

export interface Application {
  id: string; user_id: string; company_name: string; job_title: string
  job_url?: string; status: ApplicationStatus; priority?: ApplicationPriority
  work_type?: WorkType; location?: string; salary_min?: number; salary_max?: number
  application_date?: string; source?: string; excitement_level?: number
  notes?: string; job_description?: string; deadline_date?: string
  next_follow_up_date?: string; created_at: string; updated_at: string
  events?: ApplicationEvent[]
}

export interface ApplicationEvent {
  id: string; application_id: string; event_type: string; title: string
  description?: string; event_date: string; created_at: string
}

export interface Contact {
  id: string; user_id: string; name: string; email?: string; phone?: string
  company?: string; role?: string; linkedin_url?: string; notes?: string; created_at: string
}

export interface Document {
  id: string; user_id: string; name: string; doc_type: string
  storage_path?: string; file_size?: number; notes?: string
  is_default: boolean; is_link: boolean; url?: string; created_at: string
}

export interface DashboardStats {
  total: number; active: number; interviews: number; offers: number
  response_rate: number; offer_rate: number
}

export interface CreateApplicationRequest {
  company_name: string; job_title: string; job_url?: string; status: ApplicationStatus
  priority?: ApplicationPriority; work_type?: WorkType; location?: string
  salary_min?: number; salary_max?: number; application_date?: string; source?: string
  excitement_level?: number; notes?: string; job_description?: string
  deadline_date?: string; next_follow_up_date?: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: "Wishlist", applied: "Applied", phone_screen: "Phone Screen",
  interview: "Interview", offer: "Offer", rejected: "Rejected",
  withdrawn: "Withdrawn", ghosted: "Ghosted",
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  wishlist: "zinc", applied: "blue", phone_screen: "amber",
  interview: "purple", offer: "green", rejected: "red",
  withdrawn: "orange", ghosted: "slate",
}

export const STATUS_ORDER: ApplicationStatus[] = [
  "wishlist","applied","phone_screen","interview","offer","rejected","withdrawn","ghosted"
]

export const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  low:    { bg: "rgba(100,116,139,.12)", color: "#94a3b8" },
  medium: { bg: "rgba(245,158,11,.12)",  color: "#fbbf24" },
  high:   { bg: "rgba(239,68,68,.12)",   color: "#f87171" },
}
