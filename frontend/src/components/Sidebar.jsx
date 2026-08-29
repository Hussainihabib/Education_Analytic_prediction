import { NavLink } from 'react-router-dom'
import { NAV } from '../utils/nav.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const groups = NAV[user?.role] || []
  console.log("USER =", user);
  console.log("GROUPS =", NAV[user?.role]);
  console.log(user.role);

  return (
    <>
      {open && <div className="fixed inset-0 bg-navy-950/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-navy-900 text-cream-100 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full border border-amber-accent flex items-center justify-center text-amber-accent font-serif text-sm">EP</div>
          <div>
            <div className="font-serif font-semibold leading-tight text-sm">EduPredict</div>
            <div className="text-[9px] tracking-widest text-slate-400 font-mono">ANALYTICS PLATFORM</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((g) => (
            <div key={g.section}>
              <div className="px-2.5 text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-1.5">{g.section}</div>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="w-4 text-center text-amber-accent text-[13px]">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-[10px] text-slate-500 font-mono">
          v1.0.0 · Big Data & Predictive Analytics
        </div>
      </aside>
    </>
  )
}
