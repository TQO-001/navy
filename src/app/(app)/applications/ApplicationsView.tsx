"use client"
import { useState } from "react"
import { LayoutGrid, List, Table2, Plus, Search, SlidersHorizontal, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import type { Application, ApplicationStatus } from "@/types"
import { STATUS_LABELS, STATUS_ORDER } from "@/types"
import { KanbanView }   from "./KanbanView"
import { ListView }     from "./ListView"
import { TableView }    from "./TableView"
import { AddJobModal }  from "./AddJobModal"

type View = "kanban" | "table" | "list"

const SORT_OPTIONS = [
  { value: "updated_at:desc",       label: "Recently updated" },
  { value: "application_date:desc", label: "Date applied (newest)" },
  { value: "company_name:asc",      label: "Company A–Z" },
  { value: "salary_max:desc",       label: "Highest salary" },
]

export function ApplicationsView({
  allApps, filtered, counts, filterStatus, searchQuery, initialView = "kanban"
}: {
  allApps: Application[]; filtered: Application[]; counts: Record<string, number>;
  filterStatus?: string; searchQuery?: string; initialView?: View;
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [view, setView] = useState<View>(initialView)
  const [showAdd, setShowAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search)
    Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#05070a]">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search applications..."
              defaultValue={searchQuery}
              onChange={(e) => updateQuery({ q: e.target.value || null })}
              className="pl-9 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[13px] text-gray-300 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all w-64 placeholder:text-gray-700"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {( [["kanban", LayoutGrid], ["list", List], ["table", Table2]] as [View, any][] ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`p-1.5 rounded-lg transition-all ${view === v ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-blue-600/10 active:scale-95"
        >
          <Plus size={16} /> New Application
        </button>
      </div>

      {/* Filter Chips / Status Bar */}
      <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto scrollbar-hide border-b border-white/5">
        <button
          onClick={() => updateQuery({ status: null })}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${!filterStatus ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
        >
          All ({allApps.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => updateQuery({ status: s })}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
              filterStatus === s 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {STATUS_LABELS[s]} <span className="ml-1 opacity-50">{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-auto">
        {view === "kanban" && <KanbanView apps={filtered} allApps={allApps} />}
        {view === "table" && <TableView apps={filtered} selected={selected} setSelected={setSelected} />}
        {view === "list"  && <ListView  apps={filtered} selected={selected} setSelected={setSelected} />}
      </div>

      {/* Bulk Action Footer */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-[#0a0a0a] border border-blue-500/30 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <span className="text-[12px] font-bold text-blue-400 uppercase tracking-widest">
            {selected.size} Selected
          </span>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-4">
            <button className="text-[11px] font-bold text-gray-400 hover:text-white uppercase tracking-wider">Archive</button>
            <button className="text-[11px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">Delete</button>
            <button onClick={() => setSelected(new Set())} className="text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}