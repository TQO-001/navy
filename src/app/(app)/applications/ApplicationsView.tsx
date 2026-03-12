"use client"
import { useState } from "react"
import { LayoutGrid, List, Table2, Plus, Search, Download, Trash2, SlidersHorizontal } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS, STATUS_ORDER } from "@/types"
import { KanbanView }   from "./KanbanView"
import { ListView }     from "./ListView"
import { TableView }    from "./TableView"
import { AddJobModal }  from "./AddJobModal"

type View = "kanban" | "table" | "list"

const PIPELINE_COLS: ApplicationStatus[] = ["wishlist","applied","phone_screen","interview","offer","rejected","ghosted"]
const COL_LABELS: Record<ApplicationStatus,string> = {
  wishlist:"Saved", applied:"Applied", phone_screen:"Screening",
  interview:"Interview", offer:"Offer", rejected:"Rejected",
  withdrawn:"Withdrawn", ghosted:"Ghosted",
}
const SORT_OPTIONS = [
  { value: "updated_at:desc",       label: "Recently updated" },
  { value: "application_date:desc", label: "Date applied (newest)" },
  { value: "application_date:asc",  label: "Date applied (oldest)" },
  { value: "company_name:asc",      label: "Company A–Z" },
  { value: "salary_max:desc",       label: "Highest salary" },
]

export function ApplicationsView({
  allApps, filtered, counts, filterStatus, searchQuery, initialView
}: {
  allApps: Application[]; filtered: Application[]; counts: Record<ApplicationStatus,number>
  filterStatus?: string; searchQuery?: string; initialView: View
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [view, setView]             = useState<View>(initialView === "table" || initialView === "list" ? initialView : "kanban")
  const [search, setSearch]         = useState(searchQuery ?? "")
  const [sortKey, setSortKey]       = useState("updated_at:desc")
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [exporting, setExporting]   = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters]       = useState({ work_type:"", priority:"", salary_min:"" })
  const [showAddModal, setShowAddModal] = useState(false)

  function pushFilter(params: Record<string,string|undefined>) {
    const p = new URLSearchParams()
    if (filterStatus) p.set("status", filterStatus)
    if (search) p.set("q", search)
    Object.entries(params).forEach(([k,v]) => v ? p.set(k,v) : p.delete(k))
    router.push(pathname + (p.toString() ? "?"+p.toString() : ""))
  }

  function handleSearch(v: string) {
    setSearch(v)
    const p = new URLSearchParams()
    if (filterStatus) p.set("status", filterStatus)
    if (v) p.set("q", v)
    router.push(pathname + (p.toString() ? "?"+p.toString() : ""))
  }

  let apps = [...filtered]
  if (filters.work_type)  apps = apps.filter(a => a.work_type === filters.work_type)
  if (filters.priority)   apps = apps.filter(a => a.priority === filters.priority)
  if (filters.salary_min) apps = apps.filter(a => (a.salary_min ?? 0) >= parseInt(filters.salary_min))
  const [sf, sd] = sortKey.split(":")
  apps.sort((a,b) => {
    const av = (a as any)[sf] ?? ""; const bv = (b as any)[sf] ?? ""
    const c = av < bv ? -1 : av > bv ? 1 : 0; return sd === "asc" ? c : -c
  })

  async function bulkDelete() {
    if (!selected.size || !confirm(`Delete ${selected.size} application${selected.size>1?"s":""}?`)) return
    setBulkLoading(true)
    await fetch("/api/applications/bulk",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[...selected]})})
    setSelected(new Set()); setBulkLoading(false); router.refresh()
  }
  async function bulkArchive() {
    if (!selected.size) return; setBulkLoading(true)
    await fetch("/api/applications/bulk",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[...selected],status:"withdrawn"})})
    setSelected(new Set()); setBulkLoading(false); router.refresh()
  }
  async function exportCSV() {
    setExporting(true)
    const ids = selected.size > 0 ? [...selected] : apps.map(a=>a.id)
    const res = await fetch("/api/applications/export?format=csv",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids})})
    const blob = await res.blob(); const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download="navy-export.csv"; a.click(); URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Jobs</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-2)" }}>Keep track of your applied jobs all in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg hide-mobile" style={{ border:"1px solid var(--border-2)",color:"var(--muted)" }}>
            📅 {new Date().toLocaleDateString("en",{month:"short",day:"numeric"})} – now
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black"
            style={{ background: "var(--amber)" }}
          >
            <Plus size={15} /> Add Job
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        {/* View switcher */}
        <div className="flex items-center gap-1 mr-1">
          {([["kanban","Board",LayoutGrid],["list","List",List],["table","Table",Table2]] as const).map(([v,label,Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: view===v?"var(--amber-dim)":"transparent",
                color: view===v?"var(--amber)":"var(--muted-2)",
                border: view===v?"1px solid var(--amber-border)":"1px solid transparent"
              }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border-2)" }} />

        {/* Pipeline filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto hide-mobile" style={{ flex: 1 }}>
          <button
            onClick={() => pushFilter({})}
            className="text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all"
            style={{ background: !filterStatus?"var(--amber-dim)":"transparent", color: !filterStatus?"var(--amber)":"var(--muted-2)" }}
          >
            All <span className="ml-1 text-xs opacity-60">{allApps.length}</span>
          </button>
          {PIPELINE_COLS.filter(s => counts[s] > 0).map(s => (
            <button key={s}
              onClick={() => { setSelected(new Set()); pushFilter({status:s}) }}
              className="text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all"
              style={{ background: filterStatus===s?"var(--amber-dim)":"transparent", color: filterStatus===s?"var(--amber)":"var(--muted-2)" }}
            >
              {COL_LABELS[s]} <span className="ml-1 text-xs opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <select value={sortKey} onChange={e=>setSortKey(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs focus:outline-none hide-mobile"
            style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--muted-2)" }}>
            {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={()=>setShowFilters(v=>!v)} className="view-btn hide-mobile"
            style={showFilters?{background:"var(--amber-dim)",borderColor:"var(--amber-border)",color:"var(--amber)"}:{}}>
            <SlidersHorizontal size={13} />
          </button>
          <div className="relative hide-mobile">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color:"var(--muted)" }} />
            <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Filter…"
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs w-36 focus:outline-none"
              style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
          </div>
          <button onClick={exportCSV} disabled={exporting} className="view-btn hide-mobile" title="Export CSV">
            <Download size={13}/>
          </button>
          {selected.size>0 && (
            <button onClick={bulkDelete} disabled={bulkLoading}
              className="text-xs px-2.5 py-1.5 rounded-lg"
              style={{ border:"1px solid rgba(239,68,68,0.3)",color:"#f87171" }}>
              <Trash2 size={11} className="inline mr-1" />{selected.size}
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-5 py-2 flex-shrink-0 flex-wrap"
          style={{ background:"var(--surface-2)",borderBottom:"1px solid var(--border)" }}>
          <span className="text-xs font-semibold" style={{color:"var(--muted)"}}>Filters:</span>
          {[
            {key:"work_type",label:"Work type",options:[["","Any"],["onsite","On-site"],["remote","Remote"],["hybrid","Hybrid"]]},
            {key:"priority",label:"Priority",options:[["","Any"],["high","High"],["medium","Medium"],["low","Low"]]},
          ].map(f=>(
            <div key={f.key} className="flex items-center gap-1.5">
              <span className="text-xs" style={{color:"var(--muted)"}}>{f.label}:</span>
              <select value={(filters as Record<string,string>)[f.key]}
                onChange={e=>setFilters(p=>({...p,[f.key]:e.target.value}))}
                className="px-2 py-1 rounded-lg text-xs focus:outline-none"
                style={{background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)"}}>
                {f.options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button onClick={()=>setFilters({work_type:"",priority:"",salary_min:""})} className="text-xs" style={{color:"var(--amber)"}}>Clear</button>
        </div>
      )}

      {/* View */}
      <div className="flex-1 overflow-auto">
        {view==="kanban" && <KanbanView apps={apps} allApps={allApps} />}
        {view==="table" && <TableView apps={apps} selected={selected} setSelected={setSelected} />}
        {view==="list"  && <ListView  apps={apps} selected={selected} setSelected={setSelected} />}
      </div>

      {/* Footer */}
      {view!=="kanban" && apps.length>0 && (
        <div className="flex-shrink-0 px-5 py-2 text-xs flex items-center justify-between"
          style={{background:"var(--surface)",borderTop:"1px solid var(--border)",color:"var(--muted)"}}>
          <span>Showing {apps.length} of {allApps.length}</span>
          {selected.size>0&&<span style={{color:"var(--amber)"}}>{selected.size} selected · <button onClick={bulkArchive} className="underline">archive</button></span>}
        </div>
      )}

      {showAddModal && <AddJobModal onClose={() => { setShowAddModal(false); router.refresh() }} />}
    </div>
  )
}
