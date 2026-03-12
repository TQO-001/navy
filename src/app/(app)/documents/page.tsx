"use client"
import { useState, useEffect, useRef } from "react"
import { Upload, Link2, Trash2, Download, FileText, File, Image, ExternalLink, Plus, X } from "lucide-react"

interface Doc { id:string; name:string; doc_type:string; file_size:number; is_link:boolean; url?:string; created_at:string; notes?:string }

const TYPE_LABELS: Record<string,string> = { resume:"Resume / CV", cover_letter:"Cover Letter", portfolio:"Portfolio", id_document:"ID Document", reference:"Reference", other:"Other" }
const TYPE_ICONS: Record<string,React.ReactNode> = { resume:<FileText size={16}/>, cover_letter:<FileText size={16}/>, portfolio:<Image size={16}/>, id_document:<File size={16}/>, reference:<FileText size={16}/>, other:<File size={16}/> }

export default function DocumentsPage() {
  const [docs, setDocs]         = useState<Doc[]>([])
  const [loading, setLoading]   = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadForm, setUploadForm] = useState({ doc_type:"resume", notes:"" })
  const [linkForm, setLinkForm]     = useState({ name:"", url:"", doc_type:"portfolio", notes:"" })

  async function load() {
    const res = await fetch("/api/documents")
    if (res.ok) setDocs(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleFileUpload(file: File) {
    setUploading(true)
    const fd = new FormData(); fd.append("file",file); fd.append("doc_type",uploadForm.doc_type); fd.append("notes",uploadForm.notes)
    const res = await fetch("/api/documents",{ method:"POST", body:fd })
    if (res.ok) { const d=await res.json(); setDocs(p=>[d,...p]); setShowUpload(false); setUploadForm({ doc_type:"resume",notes:"" }) }
    setUploading(false)
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/documents",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...linkForm,is_link:true}) })
    if (res.ok) { const d=await res.json(); setDocs(p=>[d,...p]); setShowLink(false); setLinkForm({ name:"",url:"",doc_type:"portfolio",notes:"" }) }
  }

  async function del(id: string) {
    if (!confirm("Delete this document?")) return
    await fetch("/api/documents/"+id,{ method:"DELETE" })
    setDocs(p=>p.filter(d=>d.id!==id))
  }

  function formatSize(bytes: number) {
    if (!bytes) return ""
    if (bytes<1024) return bytes+" B"
    if (bytes<1024*1024) return (bytes/1024).toFixed(1)+" KB"
    return (bytes/1024/1024).toFixed(1)+" MB"
  }

  const grouped = Object.entries(TYPE_LABELS).map(([type,label])=>({ type, label, docs:docs.filter(d=>d.doc_type===type) })).filter(g=>g.docs.length>0)

  return (
    <div className="page-pad p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:"var(--text)" }}>Documents</h1>
          <p className="text-sm mt-1" style={{ color:"var(--muted-2)" }}>{docs.length} document{docs.length!==1?"s":""} — CVs, cover letters, IDs, links</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>{ setShowLink(true); setShowUpload(false) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ border:"1px solid var(--border-2)",color:"var(--muted-2)" }}>
            <Link2 size={14}/> Add link
          </button>
          <button onClick={()=>{ setShowUpload(true); setShowLink(false) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black"
            style={{ background:"var(--amber)" }}>
            <Upload size={14}/> Upload file
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="rounded-xl p-6 mb-6" style={{ background:"var(--surface)",border:"1px solid var(--amber-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color:"var(--text)" }}>Upload document</h2>
            <button onClick={()=>setShowUpload(false)}><X size={16} style={{ color:"var(--muted)" }}/></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Document type</label>
              <select value={uploadForm.doc_type} onChange={e=>setUploadForm(p=>({...p,doc_type:e.target.value}))}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--text)" }}>
                {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Notes (optional)</label>
              <input value={uploadForm.notes} onChange={e=>setUploadForm(p=>({...p,notes:e.target.value}))} placeholder="e.g. v3, tailored for tech"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
          </div>
          <div
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors"
            style={{ borderColor:dragOver?"var(--amber)":"var(--border-2)",background:dragOver?"var(--amber-dim)":"transparent" }}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);const file=e.dataTransfer.files[0];if(file)handleFileUpload(file)}}
            onClick={()=>fileRef.current?.click()}>
            <Upload size={28} className="mx-auto mb-3" style={{ color:"var(--muted)" }}/>
            <p className="text-sm font-medium" style={{ color:"var(--text)" }}>{uploading?"Uploading…":"Drop file here or click to browse"}</p>
            <p className="text-xs mt-1" style={{ color:"var(--muted)" }}>PDF, DOCX, PNG, JPG — max 10MB</p>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFileUpload(f)}} />
          </div>
        </div>
      )}

      {showLink && (
        <form onSubmit={addLink} className="rounded-xl p-6 mb-6" style={{ background:"var(--surface)",border:"1px solid var(--amber-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color:"var(--text)" }}>Add link</h2>
            <button type="button" onClick={()=>setShowLink(false)}><X size={16} style={{ color:"var(--muted)" }}/></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Name *</label>
              <input value={linkForm.name} onChange={e=>setLinkForm(p=>({...p,name:e.target.value}))} required placeholder="My Portfolio"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>URL *</label>
              <input value={linkForm.url} onChange={e=>setLinkForm(p=>({...p,url:e.target.value}))} required type="url" placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Type</label>
              <select value={linkForm.doc_type} onChange={e=>setLinkForm(p=>({...p,doc_type:e.target.value}))}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:"var(--surface-3)",border:"1px solid var(--border-2)",color:"var(--text)" }}>
                {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color:"var(--muted)" }}>Notes</label>
              <input value={linkForm.notes} onChange={e=>setLinkForm(p=>({...p,notes:e.target.value}))} placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:"var(--input-bg)",border:"1px solid var(--border-2)",color:"var(--text)" }} />
            </div>
          </div>
          <button type="submit" className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-black" style={{ background:"var(--amber)" }}>Save link</button>
        </form>
      )}

      {!loading && docs.length===0 && !showUpload && !showLink && (
        <div className="rounded-xl p-16 text-center" style={{ background:"var(--surface)",border:"1px dashed var(--border-2)" }}>
          <FileText size={32} className="mx-auto mb-4" style={{ color:"var(--muted)" }}/>
          <h3 className="font-semibold mb-2" style={{ color:"var(--text)" }}>No documents yet</h3>
          <p className="text-sm mb-6" style={{ color:"var(--muted-2)" }}>Upload your CV, cover letters, or add links to your portfolio.</p>
          <button onClick={()=>setShowUpload(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background:"var(--amber)" }}>Upload first document</button>
        </div>
      )}

      {grouped.map(g=>(
        <div key={g.type} className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:"var(--muted)" }}>{g.label}</h2>
          <div className="space-y-2">
            {g.docs.map(doc=>(
              <div key={doc.id} className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid var(--amber-border)" }}>
                  {TYPE_ICONS[doc.doc_type]??<File size={16}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color:"var(--text)" }}>{doc.name}</p>
                  <p className="text-xs mt-0.5" style={{ color:"var(--muted)" }}>
                    {doc.is_link?"Link":formatSize(doc.file_size)}
                    {doc.notes?" · "+doc.notes:""}
                    {" · "}{new Date(doc.created_at).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {doc.is_link&&doc.url&&<a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color:"var(--muted-2)" }} title="Open link"><ExternalLink size={14}/></a>}
                  {!doc.is_link&&<a href={"/api/documents/"+doc.id+"/file"} download className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color:"var(--muted-2)" }} title="Download"><Download size={14}/></a>}
                  <button onClick={()=>del(doc.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color:"var(--muted)" }} title="Delete"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
