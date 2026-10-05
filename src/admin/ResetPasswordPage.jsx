import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from './api'
import AuthLayout, { AuthField } from './AuthLayout'

// Personal Website Redesign/CMS fogort password.png — reached after entering the
// emailed 6-digit code, which hands over a short-lived permission (resetToken)
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const token = useLocation().state?.resetToken
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(token ? null : 'Start from “Forgot password?” on the login page to get a code first.')
  const [isSending, setIsSending] = useState(false)

  const confirm = async (event) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('The two passwords don’t match.')
      return
    }
    if (newPassword.length < 10) {
      setError('Use at least 10 characters.')
      return
    }
    setIsSending(true)
    setError(null)
    try {
      await api.post('/api/auth/reset-password', { token, newPassword })
      navigate('/admin/password-changed', { replace: true })
    } catch (problem) {
      setError(problem.message)
      setIsSending(false)
    }
  }

  return (
    <AuthLayout backTo="/admin" subtitle="Reset your password">
      <form className="auth-form" onSubmit={confirm}>
        <AuthField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
        <AuthField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
        <button className="auth-button" disabled={isSending || !token}>{isSending ? 'Saving…' : 'Confirm'}</button>
        {error && <p className="auth-form__error" role="alert">{error}</p>}
      </form>
    </AuthLayout>
  )
}
