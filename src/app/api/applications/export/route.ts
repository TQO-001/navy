import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const { ids } = await req.json()
    const format  = req.nextUrl.searchParams.get("format") ?? "csv"
    const apps = ids?.length
      ? await sql`SELECT * FROM applications WHERE id = ANY(${ids}::uuid[]) AND user_id = ${user.userId} ORDER BY updated_at DESC`
      : await sql`SELECT * FROM applications WHERE user_id = ${user.userId} ORDER BY updated_at DESC`

    if (format === "csv") {
      const header = ["Job Title","Company","Status","Location","Work Type","Salary Min","Salary Max","Application Date","Source","Priority","Deadline","Follow-up","Notes"]
      const rows   = apps.map((a: Record<string,unknown>) => [
        a.job_title, a.company_name, a.status, a.location??"", a.work_type??"",
        a.salary_min??"", a.salary_max??"", a.application_date??"", a.source??"",
        a.priority??"", a.deadline_date??"", a.next_follow_up_date??"",
        String(a.notes??"").replace(/"/g,'""'),
      ].map(v=>`"${v}"`).join(","))
      const csv = [header.map(h=>`"${h}"`).join(","), ...rows].join("\n")
      return new NextResponse(csv, { headers:{ "Content-Type":"text/csv", "Content-Disposition":`attachment; filename="navy-export.csv"` } })
    }

    const rowsHtml = apps.map((a: Record<string,unknown>) => `<tr><td>${a.job_title}</td><td>${a.company_name}</td><td>${String(a.status).replace(/_/g," ")}</td><td>${a.location??""}</td><td>${a.salary_max?"US$"+Number(a.salary_max).toLocaleString():""}</td><td>${a.application_date?new Date(String(a.application_date)).toLocaleDateString():""}</td><td>${a.priority??""}</td></tr>`).join("")
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Navy Export</title><style>body{font-family:sans-serif;font-size:12px;padding:32px;}h1{font-size:18px;margin-bottom:4px;}p{color:#888;margin-bottom:24px;}table{width:100%;border-collapse:collapse;}th{background:#f5f5f0;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}td{padding:8px 10px;border-bottom:1px solid #eee;}@media print{body{padding:0;}}</style></head><body><h1>Navy — Job Applications</h1><p>Exported ${new Date().toLocaleDateString()} · ${apps.length} application${apps.length!==1?"s":""}</p><table><thead><tr><th>Role</th><th>Company</th><th>Status</th><th>Location</th><th>Max Salary</th><th>Applied</th><th>Priority</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
    return new NextResponse(html, { headers:{ "Content-Type":"text/html" } })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
