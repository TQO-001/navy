// ─────────────────────────────────────────────────────────────────────────────
// src/app/(app)/documents/page.tsx  —  The Vault
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react"
import {
  Upload,
  Link2,
  Trash2,
  FileText,
  File,
  ExternalLink,
  X,
  Eye,
  Loader2,
  FolderOpen,
  AlertCircle,
  Download,
  FilePlus,
  Globe,
  Award,
  BookOpen,
} from "lucide-react"
import type { Document, DocumentCategory, Application } from "@/types"
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryStyle {
  bg: string
  border: string
  color: string
  glow: string
}

const CATEGORY_STYLES: Record<DocumentCategory, CategoryStyle> = {
  resume: {
    bg:     "rgba(255,39,127,0.10)",
    border: "rgba(255,39,127,0.28)",
    color:  "#FF277F",
    glow:   "0 0 22px rgba(255,39,127,0.22)",
  },
  cover_letter: {
    bg:     "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.25)",
    color:  "#60a5fa",
    glow:   "",
  },
  certificate: {
    bg:     "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
    color:  "#fbbf24",
    glow:   "",
  },
  other: {
    bg:     "rgba(113,113,122,0.10)",
    border: "rgba(113,113,122,0.20)",
    color:  "#a1a1aa",
    glow:   "",
  },
}

const CATEGORY_ICONS: Record<DocumentCategory, React.ReactNode> = {
  resume:       <Award size={16} />,
  cover_letter: <FileText size={16} />,
  certificate:  <BookOpen size={16} />,
  other:        <File size={16} />,
}

// ─────────────────────────────────────────────────────────────────────────────
// PURE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isExternalLink(doc: Document): boolean {
  return (
    doc.file_url !== null &&
    (doc.file_url.startsWith("http://") || doc.file_url.startsWith("https://"))
  )
}

function mimeLabel(mimeType: string | null): string {
  if (!mimeType) return "File"
  const map: Record<string, string> = {
    "application/pdf":   "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/png":         "PNG",
    "image/jpeg":        "JPEG",
    "image/gif":         "GIF",
    "image/webp":        "WEBP",
    "text/plain":        "TXT",
    "text/uri-list":     "Link",
  }
  return map[mimeType] ?? (mimeType.split("/")[1] ?? "File").toUpperCase()
}

function isPreviewable(doc: Document): boolean {
  if (isExternalLink(doc)) return true
  return new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "text/plain",
  ]).has(doc.file_type ?? "")
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INPUT STYLE
// ─────────────────────────────────────────────────────────────────────────────
const INPUT =
  "w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 " +
  "focus:outline-none focus:border-[#94DEFF]/40 transition-colors placeholder:text-gray-700"

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface PreviewModalProps {
  doc: Document
  onClose: () => void
}

function PreviewModal({ doc, onClose }: PreviewModalProps): React.ReactElement {
  const style    = CATEGORY_STYLES[doc.category]
  const localSrc = `/api/documents/${doc.id}/file`
  const href     = isExternalLink(doc) ? (doc.file_url ?? localSrc) : localSrc
  const isImg    = /^image\//.test(doc.file_type ?? "")

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border"
        style={{ background: "#0a0a0a", borderColor: style.border }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="p-2 rounded-lg border"
              style={{ background: style.bg, borderColor: style.border, color: style.color }}
            >
              {CATEGORY_ICONS[doc.category]}
            </span>
            <div>
              <p className="text-[13px] font-bold text-gray-200 truncate max-w-xs">{doc.name}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                {CATEGORY_LABELS[doc.category]}
                {doc.file_type ? ` · ${mimeLabel(doc.file_type)}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-bold text-gray-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <ExternalLink size={14} /> Open
            </a>
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
          {isExternalLink(doc) ? (
            <iframe
              src={doc.file_url ?? ""}
              className="w-full h-full min-h-[500px] border-0"
              title={doc.name}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : isImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localSrc}
              alt={doc.name}
              className="max-w-full max-h-[600px] object-contain mx-auto block p-4"
            />
          ) : isPreviewable(doc) ? (
            <iframe
              src={localSrc}
              className="w-full h-full min-h-[500px] border-0"
              title={doc.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <File size={48} className="text-gray-700" />
              <p className="text-[13px] text-gray-500">Preview not available for this file type.</p>
              <a
                href={localSrc}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold btn-blue-sky"
              >
                <Download size={14} /> Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
interface EmptyStateProps {
  activeCategory: DocumentCategory | "all"
  onUpload: () => void
}

function EmptyState({ activeCategory, onUpload }: EmptyStateProps): React.ReactElement {
  const isFiltered = activeCategory !== "all"
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed col-span-full"
      style={{ borderColor: "rgba(148,222,255,0.10)" }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border"
        style={{
          background:  "rgba(148,222,255,0.07)",
          borderColor: "rgba(148,222,255,0.18)",
          boxShadow:   "0 0 30px rgba(148,222,255,0.10)",
        }}
      >
        <FolderOpen size={36} style={{ color: "#94DEFF" }} />
      </div>
      <h3 className="text-[15px] font-bold text-gray-300 mb-2">
        {isFiltered
          ? `No ${CATEGORY_LABELS[activeCategory as DocumentCategory]} yet`
          : "The Vault is empty"}
      </h3>
      <p className="text-[13px] text-gray-600 text-center max-w-xs mb-8 leading-relaxed">
        {isFiltered
          ? "Try a different category or upload your first document."
          : "Upload CVs, cover letters, certificates, or link external portfolios."}
      </p>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-bold btn-pink transition-all"
      >
        <Upload size={16} /> Upload document
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT CARD
// ─────────────────────────────────────────────────────────────────────────────
interface DocCardProps {
  doc: Document
  linkedApp: Application | null
  onDelete: (id: string) => void
  onPreview: (doc: Document) => void
}

function DocCard({ doc, linkedApp, onDelete, onPreview }: DocCardProps): React.ReactElement {
  const style    = CATEGORY_STYLES[doc.category]
  const isLink   = isExternalLink(doc)
  const localSrc = `/api/documents/${doc.id}/file`

  const date = new Date(doc.created_at).toLocaleDateString("en", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  })

  return (
    <div
      className="group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-200"
      style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = style.border
        if (style.glow) e.currentTarget.style.boxShadow = style.glow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"
        e.currentTarget.style.boxShadow   = "none"
      }}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ background: style.bg, borderColor: style.border, color: style.color }}
        >
          {isLink ? <Globe size={18} /> : CATEGORY_ICONS[doc.category]}
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border"
          style={{ background: style.bg, borderColor: style.border, color: style.color }}
        >
          {mimeLabel(doc.file_type)}
        </span>
      </div>

      {/* Name + date */}
      <div>
        <p className="text-[13px] font-bold text-gray-200 leading-snug line-clamp-2 break-all">
          {doc.name}
        </p>
        <p className="text-[11px] text-gray-600 mt-1">{date}</p>
      </div>

      {/* Linked application */}
      {linkedApp && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold truncate"
          style={{
            background:  "rgba(148,222,255,0.06)",
            borderColor: "rgba(148,222,255,0.18)",
            color:       "#94DEFF",
          }}
        >
          <FileText size={10} className="flex-shrink-0" />
          <span className="truncate">{linkedApp.job_title} @ {linkedApp.company_name}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: style.color }}>
          {CATEGORY_LABELS[doc.category]}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(doc)}
            title="Preview"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#94DEFF] transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(148,222,255,0.08)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
          >
            <Eye size={13} />
          </button>
          {isLink ? (
            <a
              href={doc.file_url ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              title="Open link"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#94DEFF] transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          ) : (
            <a
              href={localSrc}
              download
              title="Download"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#94DEFF] transition-colors"
            >
              <Download size={13} />
            </a>
          )}
          <button
            onClick={() => onDelete(doc.id)}
            title="Delete"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.color      = "#FF277F"
              e.currentTarget.style.background = "rgba(255,39,127,0.08)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color      = "#6b7280"
              e.currentTarget.style.background = "transparent"
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface UploadModalProps {
  apps: Application[]
  onClose: () => void
  onCreated: (doc: Document) => void
}

function UploadModal({ apps, onClose, onCreated }: UploadModalProps): React.ReactElement {
  type Tab = "file" | "link"

  const [tab,   setTab]   = useState<Tab>("file")
  const [busy,  setBusy]  = useState(false)
  const [err,   setErr]   = useState("")
  const [drag,  setDrag]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // File form
  const [fileObj,   setFileObj]   = useState<File | null>(null)
  const [fileName,  setFileName]  = useState("")
  const [fileCat,   setFileCat]   = useState<DocumentCategory>("resume")
  const [fileAppId, setFileAppId] = useState("")

  // Link form
  const [linkName,  setLinkName]  = useState("")
  const [linkUrl,   setLinkUrl]   = useState("")
  const [linkCat,   setLinkCat]   = useState<DocumentCategory>("other")
  const [linkAppId, setLinkAppId] = useState("")

  function pickFile(f: File): void {
    setFileObj(f)
    setFileName(f.name)
    setErr("")
  }

  function onDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>): void {
    const f = e.target.files?.[0]
    if (f) pickFile(f)
  }

  async function submitFile(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!fileObj) { setErr("Please select a file."); return }
    if (fileObj.size > 10 * 1024 * 1024) { setErr("File exceeds 10 MB."); return }

    setBusy(true); setErr("")
    try {
      const fd = new FormData()
      fd.append("file",     fileObj)
      fd.append("name",     fileName || fileObj.name)
      fd.append("category", fileCat)
      if (fileAppId) fd.append("application_id", fileAppId)

      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        setErr(d.error ?? "Upload failed.")
        return
      }
      const doc = (await res.json()) as Document
      onCreated(doc)
      onClose()
    } catch {
      setErr("Network error. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function submitLink(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!linkName.trim()) { setErr("Name is required."); return }
    if (!linkUrl.trim())  { setErr("URL is required.");  return }

    setBusy(true); setErr("")
    try {
      const body = {
        name:           linkName.trim(),
        file_url:       linkUrl.trim(),
        file_type:      "text/uri-list",
        category:       linkCat,
        application_id: linkAppId || null,
      }
      const res = await fetch("/api/documents", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        setErr(d.error ?? "Failed to add link.")
        return
      }
      const doc = (await res.json()) as Document
      onCreated(doc)
      onClose()
    } catch {
      setErr("Network error. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
        style={{
          background:  "#0a0a0a",
          borderColor: "rgba(255,39,127,0.25)",
          boxShadow:   "0 0 40px rgba(255,39,127,0.10)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <FilePlus size={16} style={{ color: "#FF277F" }} />
            <h2 className="text-[14px] font-bold text-gray-100">Add to Vault</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {(["file", "link"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2"
              style={{
                borderColor: tab === t ? "#FF277F" : "transparent",
                color:       tab === t ? "#FF277F" : "#6b7280",
              }}
            >
              {t === "file" ? "Upload File" : "Add Link"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {err && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl border mb-5 text-[12px] font-medium"
              style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}
            >
              <AlertCircle size={14} /> {err}
            </div>
          )}

          {tab === "file" ? (
            <form onSubmit={submitFile} className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200"
                style={{
                  borderColor: drag ? "rgba(255,39,127,0.60)" : "rgba(255,255,255,0.08)",
                  background:  drag ? "rgba(255,39,127,0.04)" : "transparent",
                }}
              >
                {busy ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={30} style={{ color: "#FF277F" }} className="animate-spin" />
                    <p className="text-sm text-gray-400">Uploading…</p>
                  </div>
                ) : fileObj ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={28} style={{ color: "#FF277F" }} />
                    <p className="text-[13px] font-bold text-gray-300">{fileObj.name}</p>
                    <p className="text-[11px] text-gray-600">{(fileObj.size / 1024).toFixed(1)} KB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFileObj(null); setFileName("") }}
                      className="mt-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "#FF277F" }}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-[13px] font-bold text-gray-400">
                      Drop file here or{" "}
                      <span style={{ color: "#FF277F" }}>click to browse</span>
                    </p>
                    <p className="text-[11px] text-gray-700 mt-1">PDF, DOCX, PNG, JPG — max 10 MB</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                  onChange={onFileInput}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Document Name
                </label>
                <input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Senior_Frontend_Resume_2026.pdf"
                  className={INPUT}
                />
              </div>

              {/* Category + App */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <select value={fileCat} onChange={(e) => setFileCat(e.target.value as DocumentCategory)} className={INPUT}>
                    {CATEGORY_ORDER.map((c) => <option key={c} value={c} className="bg-[#0a0a0a]">{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                {apps.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Link to Job</label>
                    <select value={fileAppId} onChange={(e) => setFileAppId(e.target.value)} className={INPUT}>
                      <option value="" className="bg-[#0a0a0a]">— None —</option>
                      {apps.map((a) => <option key={a.id} value={a.id} className="bg-[#0a0a0a]">{a.job_title} @ {a.company_name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || !fileObj}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest btn-pink disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {busy ? "Uploading…" : "Upload to Vault"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitLink} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name *</label>
                <input value={linkName} onChange={(e) => setLinkName(e.target.value)} required placeholder="My Portfolio" className={INPUT} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">URL *</label>
                <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required type="url" placeholder="https://…" className={INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <select value={linkCat} onChange={(e) => setLinkCat(e.target.value as DocumentCategory)} className={INPUT}>
                    {CATEGORY_ORDER.map((c) => <option key={c} value={c} className="bg-[#0a0a0a]">{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                {apps.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Link to Job</label>
                    <select value={linkAppId} onChange={(e) => setLinkAppId(e.target.value)} className={INPUT}>
                      <option value="" className="bg-[#0a0a0a]">— None —</option>
                      {apps.map((a) => <option key={a.id} value={a.id} className="bg-[#0a0a0a]">{a.job_title} @ {a.company_name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-widest btn-blue-sky disabled:opacity-40"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {busy ? "Saving…" : "Save Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function VaultPage(): React.ReactElement {
  const [docs,         setDocs]         = useState<Document[]>([])
  const [apps,         setApps]         = useState<Application[]>([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState("")
  const [actionError,  setActionError]  = useState("")
  const [preview,      setPreview]      = useState<Document | null>(null)
  const [showModal,    setShowModal]    = useState(false)
  const [activeFilter, setActiveFilter] = useState<DocumentCategory | "all">("all")

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true); setLoadError("")
    try {
      const [docsRes, appsRes] = await Promise.all([
        fetch("/api/documents",   { signal }),
        fetch("/api/applications", { signal }),
      ])
      if (!docsRes.ok) {
        const d = (await docsRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(d.error ?? `Error ${docsRes.status}`)
      }
      setDocs(((await docsRes.json()) as Document[]) ?? [])
      setApps(((await appsRes.json().catch(() => [])) as Application[]) ?? [])
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return
      setLoadError(e instanceof Error ? e.message : "Failed to load.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  function onCreated(doc: Document): void {
    setDocs((prev) => [doc, ...prev])
  }

  async function onDelete(id: string): Promise<void> {
    if (!confirm("Delete this document?")) return
    setActionError("")
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        if (preview?.id === id) setPreview(null)
      } else {
        setActionError("Failed to delete document.")
      }
    } catch {
      setActionError("Failed to delete document.")
    }
  }

  const appMap: Record<string, Application> = Object.fromEntries(apps.map((a) => [a.id, a]))

  const filtered: Document[] =
    activeFilter === "all" ? docs : docs.filter((d) => d.category === activeFilter)

  const counts: Record<DocumentCategory | "all", number> = {
    all:          docs.length,
    resume:       docs.filter((d) => d.category === "resume").length,
    cover_letter: docs.filter((d) => d.category === "cover_letter").length,
    certificate:  docs.filter((d) => d.category === "certificate").length,
    other:        docs.filter((d) => d.category === "other").length,
  }

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-1/3 w-[500px] h-[400px] rounded-full blur-[200px]" style={{ background: "rgba(255,39,127,0.04)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: "rgba(148,222,255,0.03)" }} />
      </div>

      {preview   && <PreviewModal doc={preview} onClose={() => setPreview(null)} />}
      {showModal && <UploadModal apps={apps} onClose={() => setShowModal(false)} onCreated={onCreated} />}

      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.85)", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold text-white tracking-tight">The Vault</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-0.5 text-gray-600">
              {docs.length} document{docs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold btn-pink transition-all"
          >
            <Upload size={16} /> Add to Vault
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative space-y-6">
        {/* Errors */}
        {loadError && (
          <div
            className="flex items-center justify-between gap-3 p-4 rounded-xl border text-[13px] font-medium"
            style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}
          >
            <div className="flex items-center gap-2"><AlertCircle size={16} /> {loadError}</div>
            <button onClick={() => load()} className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#FF277F" }}>Retry</button>
          </div>
        )}
        {actionError && (
          <div
            className="flex items-center justify-between p-4 rounded-xl border text-[13px] font-medium"
            style={{ background: "rgba(255,39,127,0.06)", borderColor: "rgba(255,39,127,0.22)", color: "#FF277F" }}
          >
            {actionError}
            <button onClick={() => setActionError("")}><X size={16} /></button>
          </div>
        )}

        {/* Filter bar */}
        {!loading && docs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", ...CATEGORY_ORDER] as (DocumentCategory | "all")[]).map((cat) => {
              const count    = counts[cat]
              const style    = cat !== "all" ? CATEGORY_STYLES[cat] : null
              const isActive = activeFilter === cat
              if (count === 0 && cat !== "all") return null
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all"
                  style={
                    isActive && style
                      ? { background: style.bg, borderColor: style.border, color: style.color }
                      : isActive
                      ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.20)", color: "#fff" }
                      : { background: "transparent", borderColor: "transparent", color: "#6b7280" }
                  }
                >
                  {cat === "all" ? `All (${count})` : `${CATEGORY_LABELS[cat as DocumentCategory]} (${count})`}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-5 space-y-4" style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-4 w-10 rounded bg-white/5 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.03] animate-pulse" />
                </div>
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }} />
                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-white/[0.03] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.length === 0 ? (
              <EmptyState activeCategory={activeFilter} onUpload={() => setShowModal(true)} />
            ) : (
              filtered.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  linkedApp={doc.application_id ? (appMap[doc.application_id] ?? null) : null}
                  onDelete={onDelete}
                  onPreview={setPreview}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}