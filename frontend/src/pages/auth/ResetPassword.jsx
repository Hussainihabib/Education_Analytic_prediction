import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (code !== '123456') { setError('Invalid reset code. Use 123456 for this demo.'); return }
    const res = resetPassword({ email, newPassword })
    if (!res.ok) setError(res.error)
    else setDone(true)
  }

  return (
    <AuthLayout>
      <div className="eyebrow mb-2">Account recovery</div>
      <h2 className="font-serif text-3xl font-bold mb-1.5">Reset password</h2>
      <p className="text-sm text-slate-500 mb-6">Enter the code we sent you and choose a new password.</p>

      {!done ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Reset code</label>
            <input className="input" required placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {error && <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          <button type="submit" className="btn-primary w-full py-3">Reset password</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-teal-accent bg-teal-accent/10 px-3 py-3 rounded-lg">Your password has been reset successfully.</div>
          <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">Back to sign in</button>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        <Link to="/login" className="text-navy-900 font-medium hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
