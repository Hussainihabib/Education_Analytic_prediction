import { hdfsFiles } from '../../data/mockData.js'
import StatCard from '../../components/StatCard.jsx'

export default function HDFSStorage() {
  const files = hdfsFiles()
  const used = 78

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Connection" value="Connected" icon="●" tone="good" trendLabel="namenode-01.edupredict.local" />
        <StatCard label="Datanodes" value="6 / 6" icon="⛁" tone="good" trendLabel="all healthy" />
        <StatCard label="Total Capacity" value="64 TB" icon="▦" />
        <StatCard label="Replication Factor" value="3x" icon="◈" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Storage Usage</h3>
          <span className="text-sm font-mono text-slate-500">{used}% used · 50.0 TB / 64 TB</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-accent to-amber-accent rounded-full" style={{ width: `${used}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">Consider archiving datasets older than 18 months to free up capacity.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-navy-700 flex items-center justify-between">
          <h3 className="font-semibold">File Explorer</h3>
          <span className="text-xs font-mono text-slate-400">/edupredict/</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-navy-700">
                <th className="px-5 py-3 font-medium">Path</th>
                <th className="px-5 py-3 font-medium">Size</th>
                <th className="px-5 py-3 font-medium">Files</th>
                <th className="px-5 py-3 font-medium">Modified</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name} className="border-b border-slate-50 dark:border-navy-700/60 hover:bg-slate-50 dark:hover:bg-navy-700/40">
                  <td className="px-5 py-3 font-mono text-xs flex items-center gap-2">
                    <span>{f.type === 'dir' ? '📁' : '📄'}</span> {f.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{f.size}</td>
                  <td className="px-5 py-3 text-slate-500">{f.files ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-400">{f.modified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
