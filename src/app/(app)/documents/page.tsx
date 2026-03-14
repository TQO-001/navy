"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Upload, Link2, Trash2, Download, FileText, File,
  ExternalLink, X, Eye, Loader2, FilePlus, Globe, FolderOpen,
  AlertCircle,
} from "lucide-react"

interface Doc {
  id: string
  name: string
  doc_type: string
  file_size: number
  is_link: boolean
  url?: string
  created_at: string
  notes?: string
  storage_path?: string
}

const TYPE_LABELS: Record<string, string> = {
  resume:       "Resume / CV",
  cover_letter: "Cover Letter",
  portfolio:    "Portfolio",
  id_document:  "ID Document",
  reference:    "Reference",
  other:        "Other",
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  resume:       <FileText size={16} />,
  cover_letter: <FileText size={16} />,
  portfolio:    <Globe size={16} />,
  id_document:  <File size={16} />,
  reference:    <FileText size={16} />,
  other:        <File size={16} />,
}

// Dual-tone accent system:
// Resume → #FF277F (highest impact doc)
// Portfolio → #94DEFF (creative/sky)
// Cover letter → blue (action/application)
// Others → muted
const TYPE_ACCENT: Record<string, {
  bg: string; border: string; text: string;
  glow?: string; cssVarBg?: string; cssVarBorder?: string; cssVarColor?: string
}> = {
  resume: {
    bg: "bg-[#FF277F]/10", border: "border-[#FF277F]/25", text: "text-[#FF277F]",
    cssVarBg: "rgba(255,39,127,0.10)", cssVarBorder: "rgba(255,39,127,0.25)", cssVarColor: "#FF277F",
    glow: "0 0 20px rgba(255,39,127,0.20)",
  },
  cover_letter: {
    bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400",
    cssVarBg: "rgba(37,99,235,0.10)", cssVarBorder: "rgba(37,99,235,0.20)", cssVarColor: "#60a5fa",
  },
  portfolio: {
    bg: "bg-[#94DEFF]/10", border: "border-[#94DEFF]/20", text: "text-[#94DEFF]",
    cssVarBg: "rgba(148,222,255,0.10)", cssVarBorder: "rgba(148,222,255,0.20)", cssVarColor: "#94DEFF",
    glow: "0 0 20px rgba(148,222,255,0.15)",
  },
  id_document: {
    bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400",
    cssVarBg: "rgba(245,158,11,0.10)", cssVarBorder: "rgba(245,158,11,0.20)", cssVarColor: "#fbbf24",
  },
  reference: {
    bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400",
    cssVarBg: "rgba(16,185,129,0.10)", cssVarBorder: "rgba(16,185,129,0.20)", cssVarColor: "#34d399",
  },
  other: {
    bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400",
    cssVarBg: "rgba(113,113,122,0.10)", cssVarBorder: "rgba(113,113,122,0.20)", cssVarColor: "#a1a1aa",
  },
}

// ── Preview Modal ──────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const accent    = TYPE_ACCENT[doc.doc_type] ?? TYPE_ACCENT.other
  const isLocalPdf = !doc.is_link && /\.pdf$/i.test(doc.name ?? "")
  const isImage    = !doc.is_link && /\.(png|jpe?g|gif|webp)$/i.test(doc.name ?? "")
  const localSrc   = `/api/documents/${doc.id}/file`
  const previewSrc = doc.is_link ? doc.url : localSrc

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border"
        style={{
          background: "#0a0a0a",
          borderColor: accent.cssVarBorder ?? "rgba(255,255,255,0.10)",
          boxShadow: accent.glow ?? "none",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="p-2 rounded-lg"
              style={{
                background: accent.cssVarBg,
                color: accent.cssVarColor,
                border: `1px solid ${accent.cssVarBorder}`,
              }}
            >
              {TYPE_ICONS[doc.doc_type] ?? <File size={16} />}
            </span>
            <div>
              <p className="text-[13px] font-bold text-gray-200 truncate max-w-[300px]">{doc.name}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                {TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {previewSrc && (
              <a
                href={previewSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-colors border"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "#94DEFF",
                }}
              >
                <ExternalLink size={14} /> Open
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0" style={{ background: "#05070a" }}>
          {doc.is_link && doc.url ? (
            <iframe src={doc.url} className="w-full h-full min-h-[500px] border-0" title={doc.name} sandbox="allow-scripts allow-same-origin" />
          ) : isLocalPdf ? (
            <iframe src={localSrc} className="w-full h-full min-h-[500px] border-0" title={doc.name} />
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localSrc} alt={doc.name} className="max-w-full max-h-[600px] object-contain mx-auto block p-4" />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <File size={48} className="text-gray-700" />
              <p className="text-[13px] text-gray-500">Preview not available for this file type.</p>
              <a href={localSrc} download className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all btn-blue-sky">
                <Download size={14} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed"
      style={{ borderColor: "rgba(148,222,255,0.10)" }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border"
        style={{
          background: "rgba(148,222,255,0.07)",
          borderColor: "rgba(148,222,255,0.18)",
          boxShadow: "0 0 30px rgba(148,222,255,0.10)",
        }}
      >
        <FolderOpen size={36} style={{ color: "#94DEFF" }} />
      </div>
      <h3 className="text-[15px] font-bold text-gray-300 mb-2">No documents yet</h3>
      <p className="text-[13px] text-gray-600 text-center max-w-xs mb-8 leading-relaxed">
        Upload your CV, cover letters, or add links to your portfolio and online profiles.
      </p>
      <button onClick={onUpload} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all btn-blue-sky">
        <Upload size={16} /> Upload first document
      </button>
    </div>
  )
}

// ── Field helpers ──────────────────────────────────────────────────────────
const INPUT_CLS = "w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#94DEFF]/40 transition-colors placeholder:text-gray-800"

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs, setDocs]             = useState<Doc[]>([])
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [showLink, setShowLink]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [preview, setPreview]       = useState<Doc | null>(null)
  const [actionError, setActionError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadForm, setUploadForm] = useState({ doc_type: "resume", notes: "" })
  const [linkForm, setLinkForm]     = useState({ name: "", url: "", doc_type: "portfolio", notes: "" })

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setLoadError("")
    try {
      const res = await fetch("/api/documents", { signal })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `Error ${res.status}`) }
      const data = await res.json()
      setDocs(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return
      setLoadError(e instanceof Error ? e.message : "Failed to load documents.")
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  async function handleFileUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) { setActionError("File exceeds the 10 MB limit."); return }
    setUploading(true); setActionError("")
    try {
      const fd = new FormData()
      fd.append("file", file); fd.append("doc_type", uploadForm.doc_type); fd.append("notes", uploadForm.notes)
      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (res.ok) {
        const d = await res.json(); setDocs(p => [d, ...p]); setShowUpload(false)
        setUploadForm({ doc_type: "resume", notes: "" })
        if (fileRef.current) fileRef.current.value = ""
      } else { const d = await res.json(); setActionError(d.error ?? "Upload failed.") }
    } catch { setActionError("Upload failed. Check your connection.") }
    finally { setUploading(false) }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault(); setActionError("")
    try {
      const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...linkForm, is_link: true }) })
      if (res.ok) { const d = await res.json(); setDocs(p => [d, ...p]); setShowLink(false); setLinkForm({ name: "", url: "", doc_type: "portfolio", notes: "" }) }
      else { const d = await res.json(); setActionError(d.error ?? "Failed to add link.") }
    } catch { setActionError("Failed to add link.") }
  }

  async function del(id: string) {
    if (!confirm("Delete this document?")) return
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (res.ok) { setDocs(p => p.filter(d => d.id !== id)); if (preview?.id === id) setPreview(null) }
      else setActionError("Failed to delete.")
    } catch { setActionError("Failed to delete.") }
  }

  function formatSize(bytes: number) {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const grouped = Object.entries(TYPE_LABELS)
    .map(([type, label]) => ({ type, label, docs: docs.filter(d => d.doc_type === type) }))
    .filter(g => g.docs.length > 0)

  return (
    <div className="min-h-screen bg-[#05070a]">
      {preview && <PreviewModal doc={preview} onClose={() => setPreview(null)} />}

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.80)", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-tight">Documents</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-0.5 text-gray-600">
              {docs.length} file{docs.length !== 1 ? "s" : ""} — CVs, letters, links
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sky-accented secondary button */}
            <button
              onClick={() => { setShowLink(v => !v); setShowUpload(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all border"
              style={
                showLink
                  ? { background: "rgba(148,222,255,0.10)", borderColor: "rgba(148,222,255,0.30)", color: "#94DEFF" }
                  : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.10)", color: "#9ca3af" }
              }
            >
              <Link2 size={14} /> Add Link
            </button>
            {/* Pink primary upload button */}
            <button
              onClick={() => { setShowUpload(v => !v); setShowLink(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider text-white transition-all btn-pink"
            >
              <Upload size={14} /> Upload File
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Errors */}
        {loadError && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl border text-[13px] font-medium" style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}>
            <div className="flex items-center gap-2"><AlertCircle size={16} />{loadError}</div>
            <button onClick={() => load()} className="text-[11px] font-bold uppercase tracking-wider text-pink-300 hover:text-white">Retry</button>
          </div>
        )}
        {actionError && (
          <div className="flex items-center justify-between p-4 rounded-xl border text-[13px] font-medium" style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}>
            {actionError}<button onClick={() => setActionError("")}><X size={16} /></button>
          </div>
        )}

        {/* ── Upload Panel ── */}
        {showUpload && (
          <div
            className="rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 border"
            style={{ background: "#0a0a0a", borderColor: "rgba(255,39,127,0.22)", boxShadow: "0 0 30px rgba(255,39,127,0.08)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <FilePlus size={16} style={{ color: "#FF277F" }} />
                <h2 className="text-[13px] font-bold text-gray-200">Upload Document</h2>
              </div>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Document Type</label>
                  <select value={uploadForm.doc_type} onChange={e => setUploadForm(p => ({ ...p, doc_type: e.target.value }))} className={INPUT_CLS}>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#0a0a0a]">{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Notes (optional)</label>
                  <input value={uploadForm.notes} onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. v3, tailored for tech" className={INPUT_CLS} />
                </div>
              </div>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200"
                style={{
                  borderColor: dragOver ? "rgba(255,39,127,0.60)" : "rgba(255,255,255,0.08)",
                  background:  dragOver ? "rgba(255,39,127,0.04)" : "transparent",
                }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} style={{ color: "#FF277F" }} className="animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Uploading…</p>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-[13px] font-bold text-gray-400">Drop file here or <span style={{ color: "#FF277F" }}>click to browse</span></p>
                    <p className="text-[11px] text-gray-700 mt-1">PDF, DOCX, PNG, JPG — max 10 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Add Link Panel ── */}
        {showLink && (
          <form
            onSubmit={addLink}
            className="rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 border"
            style={{ background: "#0a0a0a", borderColor: "rgba(148,222,255,0.22)", boxShadow: "0 0 30px rgba(148,222,255,0.07)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2"><Link2 size={16} style={{ color: "#94DEFF" }} /><h2 className="text-[13px] font-bold text-gray-200">Add External Link</h2></div>
              <button type="button" onClick={() => setShowLink(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name *</label><input value={linkForm.name} onChange={e => setLinkForm(p => ({ ...p, name: e.target.value }))} required placeholder="My Portfolio" className={INPUT_CLS} /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">URL *</label><input value={linkForm.url} onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))} required type="url" placeholder="https://..." className={INPUT_CLS} /></div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Type</label>
                <select value={linkForm.doc_type} onChange={e => setLinkForm(p => ({ ...p, doc_type: e.target.value }))} className={INPUT_CLS}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#0a0a0a]">{l}</option>)}
                </select>
              </div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Notes</label><input value={linkForm.notes} onChange={e => setLinkForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" className={INPUT_CLS} /></div>
              <div className="sm:col-span-2">
                <button type="submit" className="px-6 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest transition-all btn-blue-sky" style={{ borderColor: "rgba(148,222,255,0.20)" }}>
                  Save Link
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} style={{ color: "#94DEFF" }} className="animate-spin" />
            <span className="text-[13px] text-gray-600">Loading documents…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !loadError && docs.length === 0 && !showUpload && !showLink && (
          <EmptyState onUpload={() => setShowUpload(true)} />
        )}

        {/* ── Document Groups ── */}
        {!loading && grouped.map(g => {
          const accent = TYPE_ACCENT[g.type] ?? TYPE_ACCENT.other
          return (
            <div key={g.type}>
              {/* Group header with accent color */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: accent.cssVarColor }}
                >
                  {g.label}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    background: accent.cssVarBg,
                    borderColor: accent.cssVarBorder,
                    color: accent.cssVarColor,
                  }}
                >
                  {g.docs.length}
                </span>
              </div>

              <div className="space-y-2">
                {g.docs.map(doc => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all"
                    style={{
                      background: "#0a0a0a",
                      borderColor: "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accent.cssVarBorder ?? "rgba(255,255,255,0.10)"
                      if (accent.glow) e.currentTarget.style.boxShadow = accent.glow
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    {/* Icon badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        background: accent.cssVarBg,
                        borderColor: accent.cssVarBorder,
                        color: accent.cssVarColor,
                      }}
                    >
                      {doc.is_link ? <Link2 size={16} /> : (TYPE_ICONS[doc.doc_type] ?? <File size={16} />)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-200 truncate">{doc.name}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                        {doc.is_link ? "External link" : formatSize(doc.file_size)}
                        {doc.notes ? ` · ${doc.notes}` : ""}
                        {" · "}
                        {new Date(doc.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreview(doc)} title="Preview"
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-gray-500 hover:text-[#94DEFF] hover:bg-[#94DEFF]/5">
                        <Eye size={14} />
                      </button>
                      {doc.is_link && doc.url
                        ? <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Open" className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-[#94DEFF] hover:bg-[#94DEFF]/5 transition-colors"><ExternalLink size={14} /></a>
                        : <a href={`/api/documents/${doc.id}/file`} download title="Download" className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-[#94DEFF] hover:bg-[#94DEFF]/5 transition-colors"><Download size={14} /></a>
                      }
                      <button onClick={() => del(doc.id)} title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-[#FF277F] hover:bg-[#FF277F]/8 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}