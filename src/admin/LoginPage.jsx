import { useState } from 'react'
import { api } from './api'

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
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={logIn}>
        <h1>Portfolio CMS</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-button admin-button--primary" disabled={isSending}>
          {isSending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </main>
  )
}
