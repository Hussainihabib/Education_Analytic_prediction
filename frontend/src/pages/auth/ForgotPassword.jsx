import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { requestPasswordReset } = useAuth()
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    requestPasswordReset(email)
    setSent(true)
  }

  return (
    <AuthLayout>
      <div className="eyebrow mb-2">Account recovery</div>
      <h2 className="font-serif text-3xl font-bold mb-1.5">Forgot password</h2>
      <p className="text-sm text-slate-500 mb-6">Enter your institution email and we'll send a reset code.</p>

      {!sent ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" required placeholder="you@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Send reset code</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-teal-accent bg-teal-accent/10 px-3 py-3 rounded-lg">
            If an account exists for <strong>{email}</strong>, a 6-digit reset code has been sent. For this demo, use code <strong>123456</strong>.
          </div>
          <button onClick={() => navigate('/reset-password', { state: { email } })} className="btn-primary w-full py-3">
            Continue to reset password
          </button>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        Remembered it? <Link to="/login" className="text-navy-900 font-medium hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
