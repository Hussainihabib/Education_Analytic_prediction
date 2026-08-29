import { useMemo, useState } from 'react'

export default function DataTable({
  columns, rows, searchKeys = [], filters = [], pageSize = 8, rowKey = 'id', renderActions,
}) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let out = rows
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val && val !== 'all') out = out.filter((r) => String(r[key]) === val)
    })
    return out
  }, [rows, query, activeFilters, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-navy-700">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          placeholder="Search..."
          className="input max-w-xs"
        />
        {filters.map((f) => (
          <select
            key={f.key}
            className="input max-w-[160px]"
            value={activeFilters[f.key] || 'all'}
            onChange={(e) => { setActiveFilters((p) => ({ ...p, [f.key]: e.target.value })); setPage(1) }}
          >
            <option value="all">{f.label}: All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} results</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-navy-700">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">{c.label}</th>
              ))}
              {renderActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400 text-sm">
                  No records match your search.
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr key={row[rowKey]} className="border-b border-slate-50 dark:border-navy-700/60 hover:bg-slate-50 dark:hover:bg-navy-700/40 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {renderActions && <td className="px-4 py-3 text-right">{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-navy-700 text-sm">
        <span className="text-slate-400 text-xs">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button className="btn-secondary px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button className="btn-secondary px-3 py-1.5" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
