import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { ROLE_LABEL } from '../../utils/nav.js'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { showToast } = useData()
  const [name, setName] = useState(user?.name || '')
  const [language, setLanguage] = useState('English (US)')
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })

  const saveProfile = (e) => {
    e.preventDefault()
    updateProfile({ name })
    showToast('Profile updated.')
  }

  const savePassword = (e) => {
    e.preventDefault()
    if (pw.next !== pw.confirm) { showToast('New passwords do not match.', 'warning'); return }
    setPw({ current: '', next: '', confirm: '' })
    showToast('Password changed successfully.')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-5">
        <h3 className="font-semibold mb-4">Profile</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-navy-900 text-cream-100 flex items-center justify-center text-lg font-medium">
              {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-slate-400">{ROLE_LABEL[user?.role]} · {user?.sub}</div>
            </div>
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Save Profile</button>
        </form>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input className="input" type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">New password</label>
              <input className="input" type="password" required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input className="input" type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-slate-400">Switch between light and dark mode</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTheme('light')} className={theme === 'light' ? 'btn-primary text-xs px-3 py-1.5' : 'btn-secondary text-xs px-3 py-1.5'}>Light</button>
              <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'btn-primary text-xs px-3 py-1.5' : 'btn-secondary text-xs px-3 py-1.5'}>Dark</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Language</div>
              <div className="text-xs text-slate-400">Interface display language</div>
            </div>
            <select className="input max-w-[180px]" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Urdu</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
