"use client"
import { useState, useEffect, useRef } from "react"
import {
  Upload, Link2, Trash2, Download, FileText, File, Image,
  ExternalLink, X, Eye, Loader2, FilePlus, Globe, FolderOpen
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
  resume: "Resume / CV",
  cover_letter: "Cover Letter",
  portfolio: "Portfolio",
  id_document: "ID Document",
  reference: "Reference",
  other: "Other",
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  resume: <FileText size={16} />,
  cover_letter: <FileText size={16} />,
  portfolio: <Globe size={16} />,
  id_document: <File size={16} />,
  reference: <FileText size={16} />,
  other: <File size={16} />,
}

const TYPE_ACCENT: Record<string, { bg: string; border: string; text: string }> = {
  resume:       { bg: "bg-blue-500/10",    border: "border-blue-500/20",   text: "text-blue-400" },
  cover_letter: { bg: "bg-purple-500/10",  border: "border-purple-500/20", text: "text-purple-400" },
  portfolio:    { bg: "bg-emerald-500/10", border: "border-emerald-500/20",text: "text-emerald-400" },
  id_document:  { bg: "bg-amber-500/10",   border: "border-amber-500/20",  text: "text-amber-400" },
  reference:    { bg: "bg-sky-500/10",     border: "border-sky-500/20",    text: "text-sky-400" },
  other:        { bg: "bg-zinc-500/10",    border: "border-zinc-500/20",   text: "text-zinc-400" },
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const isLocalPdf =
    !doc.is_link && (doc.name?.endsWith(".pdf") || doc.storage_path?.endsWith(".pdf"))
  const isImage =
    !doc.is_link &&
    /\.(png|jpe?g|gif|webp)$/i.test(doc.name ?? "")

  const src = doc.is_link ? doc.url : `/api/documents/${doc.id}/file`

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-lg ${TYPE_ACCENT[doc.doc_type]?.bg ?? "bg-zinc-500/10"} ${TYPE_ACCENT[doc.doc_type]?.text ?? "text-zinc-400"}`}>
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
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[12px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={14} /> Open
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {doc.is_link && doc.url ? (
            <iframe
              src={doc.url}
              className="w-full h-full min-h-[500px] border-0"
              title={doc.name}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : isLocalPdf ? (
            <iframe
              src={`/api/documents/${doc.id}/file`}
              className="w-full h-full min-h-[500px] border-0"
              title={doc.name}
            />
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/documents/${doc.id}/file`}
              alt={doc.name}
              className="max-w-full max-h-[600px] object-contain mx-auto block p-4"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <File size={48} className="text-gray-700" />
              <p className="text-[13px] text-gray-500">Preview not available for this file type.</p>
              <a
                href={`/api/documents/${doc.id}/file`}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold transition-all"
              >
                <Download size={14} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl mx-6 mt-6">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
        <FolderOpen size={36} className="text-blue-400" />
      </div>
      <h3 className="text-[15px] font-bold text-gray-300 mb-2">No documents yet</h3>
      <p className="text-[13px] text-gray-600 text-center max-w-xs mb-8 leading-relaxed">
        Upload your CV, cover letters, or add links to your portfolio and online profiles.
      </p>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-blue-600/20"
      >
        <Upload size={16} /> Upload first document
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<Doc | null>(null)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const [uploadForm, setUploadForm] = useState({ doc_type: "resume", notes: "" })
  const [linkForm, setLinkForm] = useState({ name: "", url: "", doc_type: "portfolio", notes: "" })

  async function load() {
    try {
      const res = await fetch("/api/documents")
      if (res.ok) setDocs(await res.json())
    } catch {
      setError("Failed to load documents.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleFileUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10 MB limit.")
      return
    }
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("doc_type", uploadForm.doc_type)
      fd.append("notes", uploadForm.notes)
      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (res.ok) {
        const d = await res.json()
        setDocs(p => [d, ...p])
        setShowUpload(false)
        setUploadForm({ doc_type: "resume", notes: "" })
      } else {
        const d = await res.json()
        setError(d.error ?? "Upload failed.")
      }
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...linkForm, is_link: true }),
      })
      if (res.ok) {
        const d = await res.json()
        setDocs(p => [d, ...p])
        setShowLink(false)
        setLinkForm({ name: "", url: "", doc_type: "portfolio", notes: "" })
      } else {
        const d = await res.json()
        setError(d.error ?? "Failed to add link.")
      }
    } catch {
      setError("Failed to add link.")
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this document?")) return
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" })
      setDocs(p => p.filter(d => d.id !== id))
    } catch {
      setError("Failed to delete document.")
    }
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

      {/* Page Header */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-tight">Documents</h1>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-0.5">
              {docs.length} file{docs.length !== 1 ? "s" : ""} — CVs, letters, links
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowLink(v => !v); setShowUpload(false) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all border ${
                showLink
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Link2 size={14} /> Add Link
            </button>
            <button
              onClick={() => { setShowUpload(v => !v); setShowLink(false) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${
                showUpload
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
              }`}
            >
              <Upload size={14} /> Upload File
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium">
            {error}
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        {/* Upload Panel */}
        {showUpload && (
          <div className="rounded-2xl bg-[#0a0a0a] border border-blue-500/20 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <FilePlus size={16} className="text-blue-400" />
                <h2 className="text-[13px] font-bold text-gray-200">Upload Document</h2>
              </div>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Document Type
                  </label>
                  <select
                    value={uploadForm.doc_type}
                    onChange={e => setUploadForm(p => ({ ...p, doc_type: e.target.value }))}
                    className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v} className="bg-[#0a0a0a]">{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Notes (optional)
                  </label>
                  <input
                    value={uploadForm.notes}
                    onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="e.g. v3, tailored for tech roles"
                    className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-800"
                  />
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleFileUpload(file)
                }}
                onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-blue-500/60 bg-blue-500/5"
                    : "border-white/10 hover:border-blue-500/30 hover:bg-white/[0.01]"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-blue-400 animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Uploading…</p>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-[13px] font-bold text-gray-400">
                      Drop file here or <span className="text-blue-400">click to browse</span>
                    </p>
                    <p className="text-[11px] text-gray-700 mt-1">PDF, DOCX, PNG, JPG — max 10 MB</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Link Panel */}
        {showLink && (
          <form
            onSubmit={addLink}
            className="rounded-2xl bg-[#0a0a0a] border border-blue-500/20 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-blue-400" />
                <h2 className="text-[13px] font-bold text-gray-200">Add External Link</h2>
              </div>
              <button type="button" onClick={() => setShowLink(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name *</label>
                <input
                  value={linkForm.name}
                  onChange={e => setLinkForm(p => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="My Portfolio"
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">URL *</label>
                <input
                  value={linkForm.url}
                  onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))}
                  required
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Type</label>
                <select
                  value={linkForm.doc_type}
                  onChange={e => setLinkForm(p => ({ ...p, doc_type: e.target.value }))}
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0a0a0a]">{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Notes</label>
                <input
                  value={linkForm.notes}
                  onChange={e => setLinkForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-800"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  Save Link
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="text-blue-400 animate-spin" />
            <span className="text-[13px] text-gray-600">Loading documents…</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && docs.length === 0 && !showUpload && !showLink && (
          <EmptyState onUpload={() => setShowUpload(true)} />
        )}

        {/* Document Groups */}
        {!loading && grouped.map(g => {
          const accent = TYPE_ACCENT[g.type] ?? TYPE_ACCENT.other
          return (
            <div key={g.type}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accent.text}`}>
                  {g.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accent.bg} ${accent.border} border ${accent.text}`}>
                  {g.docs.length}
                </span>
              </div>

              <div className="space-y-2">
                {g.docs.map(doc => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${accent.bg} ${accent.border} ${accent.text}`}>
                      {doc.is_link ? <Link2 size={16} /> : (TYPE_ICONS[doc.doc_type] ?? <File size={16} />)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-200 truncate">{doc.name}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                        {doc.is_link ? "External link" : formatSize(doc.file_size)}
                        {doc.notes ? ` · ${doc.notes}` : ""}
                        {" · "}
                        {new Date(doc.created_at).toLocaleDateString("en", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Preview */}
                      <button
                        onClick={() => setPreview(doc)}
                        title="Preview"
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Open Link / Download */}
                      {doc.is_link && doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open link"
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <a
                          href={`/api/documents/${doc.id}/file`}
                          download
                          title="Download"
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                          <Download size={14} />
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => del(doc.id)}
                        title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      >
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