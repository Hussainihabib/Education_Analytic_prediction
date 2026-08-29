export default function StatCard({ label, value, icon, trend, trendLabel, tone = 'default' }) {
  const toneMap = {
    default: 'text-navy-900 dark:text-cream-100',
    good: 'text-teal-accent',
    bad: 'text-red-500',
    warn: 'text-amber-accent',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="eyebrow">{label}</span>
        {icon && <span className="text-lg opacity-70">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold mt-2 ${toneMap[tone]}`}>{value}</div>
      {trendLabel && (
        <div className="mt-1.5 text-xs font-medium flex items-center gap-1">
          {trend === 'up' && <span className="text-teal-accent">▲</span>}
          {trend === 'down' && <span className="text-red-500">▼</span>}
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
