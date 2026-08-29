export default function RoleCard({ icon, title, subtitle, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${
        active
          ? 'border-navy-900 bg-white shadow-md ring-1 ring-navy-900'
          : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
      }`}
    >
      <div className="text-amber-accent text-xl mb-2">{icon}</div>
      <div className="font-semibold text-navy-900 text-sm">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
    </button>
  )
}
