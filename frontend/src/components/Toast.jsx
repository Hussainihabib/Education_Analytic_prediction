import { useData } from '../context/DataContext.jsx'

export default function Toast() {
  const { toast } = useData()
  if (!toast) return null
  const tones = {
    success: 'bg-navy-900 text-cream-100 border-teal-accent/40',
    warning: 'bg-navy-900 text-cream-100 border-amber-accent/40',
  }
  return (
    <div key={toast.key} className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${tones[toast.tone] || tones.success}`}>
      {toast.message}
    </div>
  )
}
