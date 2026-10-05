import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from './api'
import AuthLayout, { AuthField } from './AuthLayout'

// Personal Website Redesign/CMS Login.png
export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)

  const logIn = async (event) => {
    event.preventDefault()
    setIsSending(true)
    setError(null)
    try {
      onLoggedIn(await api.post('/api/auth/login', { email, password }))
    } catch (problem) {
      setError(problem.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AuthLayout backTo="/" subtitle={<>A management system for managing content on<br />your personal website</>}>
      <form className="auth-form" onSubmit={logIn}>
        <AuthField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <AuthField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <Link to="/admin/forgot-password" className="auth-form__link">Forgot password?</Link>
        <button className="auth-button" disabled={isSending}>{isSending ? 'Logging in…' : 'Login'}</button>
        {error && <p className="auth-form__error" role="alert">{error}</p>}
      </form>
    </AuthLayout>
  )
}
