const TONE = {
  low: 'bg-teal-accent/10 text-teal-accent',
  watch: 'bg-amber-accent/10 text-amber-accent',
  high: 'bg-red-500/10 text-red-500',
  active: 'bg-teal-accent/10 text-teal-accent',
  inactive: 'bg-slate-200 text-slate-500 dark:bg-navy-600 dark:text-slate-300',
  'on leave': 'bg-amber-accent/10 text-amber-accent',
  success: 'bg-teal-accent/10 text-teal-accent',
  warning: 'bg-amber-accent/10 text-amber-accent',
  critical: 'bg-red-500/10 text-red-500',
  info: 'bg-sky-500/10 text-sky-500',
  failed: 'bg-red-500/10 text-red-500',
  open: 'bg-sky-500/10 text-sky-500',
  closed: 'bg-slate-200 text-slate-500 dark:bg-navy-600 dark:text-slate-300',
  healthy: 'bg-teal-accent/10 text-teal-accent',
  degraded: 'bg-amber-accent/10 text-amber-accent',
}

export function StatusBadge({ value }) {
  const cls = TONE[value] || 'bg-slate-200 text-slate-500'
  return <span className={`badge ${cls} capitalize`}>{value}</span>
}

export function RiskBadge({ value }) {
  const label = { low: 'Low risk', watch: 'Watch', high: 'High risk' }[value] || value
  return <span className={`badge ${TONE[value]}`}>{label}</span>
}
