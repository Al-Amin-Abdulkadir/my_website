import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useParams } from 'react-router-dom'
import { api } from './api'
import LoginPage from './LoginPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import ResetPasswordPage from './ResetPasswordPage'
import PasswordChangedPage from './PasswordChangedPage'
import EntryList from './EntryList'
import EntryEditor from './EntryEditor'
import ProjectsLayoutEditor from './ProjectsLayoutEditor'
import HomePhotosEditor from './HomePhotosEditor'
import ExploreEditor from './ExploreEditor'
import SiteColorsEditor from './SiteColorsEditor'
import AdminDrawer from './AdminDrawer'
import './admin.css'

// The CMS editor at /admin. The password pages work while logged out; everything
// else checks the login first.
export default function AdminApp() {
  return (
    <Routes>
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="password-changed" element={<PasswordChangedPage />} />
      <Route path="*" element={<SignedInArea />} />
    </Routes>
  )
}

function SignedInArea() {
  const [admin, setAdmin] = useState(undefined)   // undefined = still checking, null = logged out
  const [startupError, setStartupError] = useState(null)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(setAdmin)
      .catch((problem) => {
        // 401 just means "not logged in"; anything else (e.g. the server is down) is shown as is
        if (problem.status === 401) setAdmin(null)
        else setStartupError(problem.message)
      })
  }, [])

  if (startupError) return <div className="admin-loading"><p className="admin-error">{startupError}</p></div>
  if (admin === undefined) return <div className="admin-loading">Loading the editor…</div>
  if (admin === null) return <LoginPage onLoggedIn={setAdmin} />

  return (
    <div className="admin">
      <AdminHeader onLoggedOut={() => setAdmin(null)} />
      <Routes>
        <Route index element={<EntryList kind="project" title="Projects" editorPath="/admin/projects" />} />
        <Route path="projects/:id" element={<EditEntryById backTo={{ to: '/admin', label: 'All projects' }} />} />
        <Route path="explore" element={<ExploreEditor />} />
        <Route path="about" element={<EntryEditor loadPath="/api/admin/pages/about" />} />
        <Route path="projects-layout" element={<ProjectsLayoutEditor />} />
        <Route path="home-photos" element={<HomePhotosEditor />} />
        <Route path="colors" element={<SiteColorsEditor />} />
      </Routes>
    </div>
  )
}

function EditEntryById({ backTo }) {
  const { id } = useParams()
  return <EntryEditor key={id} loadPath={`/api/admin/entries/${id}`} backTo={backTo} />
}

function AdminHeader({ onLoggedOut }) {
  return (
    <header className="admin-header">
      <NavLink to="/admin" className="admin-brand">Portfolio CMS</NavLink>
      <AdminDrawer onLoggedOut={onLoggedOut} />
    </header>
  )
}
