import { useEffect, useRef, useState } from "react";
import { useData } from "../../context/DataContext.jsx";
import { apiErrorMessage } from "../../utils/validation";
import {
  getIngestibleCollections,
  uploadDataset,
  getIngestionHistory,
} from "../../api/ingestionApi";

const ACCEPTED = [".csv", ".xlsx", ".xls", ".json"];

export default function DataIngestion() {
  const [dragging, setDragging] = useState(false)
  const [collections, setCollections] = useState([])
  const [targetCollection, setTargetCollection] = useState("students")
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState("")
  const inputRef = useRef(null)
  const { showToast } = useData()

  useEffect(() => {
    loadCollections()
    loadHistory()
  }, [])

  async function loadCollections() {
    try {
      const res = await getIngestibleCollections()
      setCollections(res?.collections || [])
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function loadHistory() {
    try {
      setHistoryLoading(true)
      const res = await getIngestionHistory()
      setHistory(res?.history || [])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setHistoryLoading(false)
    }
  }

  const acceptFiles = (fileList) => {
    setError("")

    const files = Array.from(fileList).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      progress: 0,
      status: 'uploading',
      file: f,
    }))

    setQueue((q) => [...files, ...q])
    files.forEach((f) => runUpload(f))
  }

  const runUpload = async (queued) => {
    try {
      const result = await uploadDataset(
        targetCollection,
        queued.file,
        (pct) => {
          setQueue((q) => q.map((f) => (f.id === queued.id ? { ...f, progress: pct } : f)))
        }
      )

      const hasErrors = (result?.skipped || 0) > 0
      setQueue((q) => q.map((f) => (
        f.id === queued.id
          ? { ...f, progress: 100, status: hasErrors ? 'warning' : 'success' }
          : f
      )))

      showToast(
        `${queued.name}: ${result.inserted} inserted, ${result.updated} updated` +
          (hasErrors ? `, ${result.skipped} skipped` : ''),
        hasErrors ? 'warning' : 'success'
      )

      loadHistory()
    } catch (err) {
      setQueue((q) => q.map((f) => (f.id === queued.id ? { ...f, progress: 100, status: 'error' } : f)))
      showToast(apiErrorMessage(err, `${queued.name} failed to import.`), 'error')
      loadHistory()
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) acceptFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-slate-500">Import into:</label>
        <select
          className="input w-auto"
          value={targetCollection}
          onChange={(e) => setTargetCollection(e.target.value)}
        >
          {(collections.length ? collections : ['students', 'teachers', 'courses', 'attendance', 'results']).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">
          Rows are matched on the collection's ID field — re-uploading a corrected file updates existing records instead of duplicating them.
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`card border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          dragging ? 'border-amber-accent bg-amber-accent/5' : 'border-slate-200 dark:border-navy-600'
        }`}
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(',')} className="hidden" onChange={(e) => e.target.files?.length && acceptFiles(e.target.files)} />
        <div className="text-3xl mb-3">⇧</div>
        <p className="font-medium">Drag & drop files here, or click to browse</p>
        <p className="text-sm text-slate-400 mt-1">Supports CSV, Excel (.xlsx), and JSON — multiple files at once</p>
      </div>

      {queue.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Upload Queue</h3>
          <div className="space-y-4">
            {queue.map((f) => (
              <div key={f.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{f.name}</span>
                  <span className="text-slate-400 text-xs">{f.size} · {Math.round(f.progress)}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      f.status === 'success' ? 'bg-teal-accent'
                        : f.status === 'error' ? 'bg-red-500'
                        : f.status === 'warning' ? 'bg-amber-accent'
                        : 'bg-amber-accent'
                    }`}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-navy-700 flex items-center justify-between">
          <h3 className="font-semibold">Upload History & Validation</h3>
          <button onClick={loadHistory} className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline">
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <div className="text-center py-8 text-sm text-slate-400">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">No uploads yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-navy-700">
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Collection</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Rows</th>
                  <th className="px-5 py-3 font-medium">Errors</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.log_id} className="border-b border-slate-50 dark:border-navy-700/60">
                    <td className="px-5 py-3 font-medium">{h.file}</td>
                    <td className="px-5 py-3 text-slate-500">{h.type}</td>
                    <td className="px-5 py-3 text-slate-500">{h.collection}</td>
                    <td className="px-5 py-3 text-slate-500">{h.size}</td>
                    <td className="px-5 py-3 text-slate-500">{(h.rows ?? 0).toLocaleString()}</td>
                    <td className={`px-5 py-3 ${h.errors ? 'text-red-500' : 'text-slate-500'}`}>{h.errors ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${
                        h.status === 'success' ? 'bg-teal-accent/10 text-teal-accent'
                          : h.status === 'warning' ? 'bg-amber-accent/10 text-amber-accent'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {h.uploaded_at ? new Date(h.uploaded_at).toLocaleString() : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
