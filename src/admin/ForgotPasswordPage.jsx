import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import AuthLayout, { AuthField } from './AuthLayout'

// "Forgot password?" in two steps, before the Reset design:
//   1. type the email → a 6-digit code is emailed (same answer for any email, so
//      it never reveals the admin's address)
//   2. type the code → on to choosing a new password
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')          // 'email' | 'code'
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)

  const sendCode = async (event) => {
    event?.preventDefault()
    setIsSending(true)
    setError(null)
    try {
      setNote((await api.post('/api/auth/forgot-password', { email })).message)
      setCode('')
      setStep('code')
    } catch (problem) {
      setError(problem.message)
    } finally {
      setIsSending(false)
    }
  }

  const checkCode = async (event) => {
    event.preventDefault()
    setIsSending(true)
    setError(null)
    try {
      const { resetToken } = await api.post('/api/auth/verify-reset-code', { email, code })
      // The permission travels in the page's memory, not the address bar,
      // so it never lands in the browser's history
      navigate('/admin/reset-password', { state: { resetToken } })
    } catch (problem) {
      setError(problem.message)
      setIsSending(false)
    }
  }

  if (step === 'code') {
    return (
      <AuthLayout backTo="/admin" subtitle="Enter the 6-digit code">
        <form className="auth-form" onSubmit={checkCode}>
          <p className="auth-form__hint">{note}</p>
          <input
            className="auth-field auth-field--code"
            aria-label="6-digit code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
          />
          <button className="auth-button" disabled={isSending || code.length !== 6}>
            {isSending ? 'Checking…' : 'Continue'}
          </button>
          {error && <p className="auth-form__error" role="alert">{error}</p>}
          <button type="button" className="auth-form__link auth-form__link--button" onClick={sendCode} disabled={isSending}>
            Send a new code
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout backTo="/admin" subtitle="Reset your password">
      <form className="auth-form" onSubmit={sendCode}>
        <AuthField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <button className="auth-button" disabled={isSending}>{isSending ? 'Sending…' : 'Send code'}</button>
        {error && <p className="auth-form__error" role="alert">{error}</p>}
      </form>
    </AuthLayout>
  )
}
