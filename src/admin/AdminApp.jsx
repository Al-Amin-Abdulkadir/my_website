import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { api } from './api'
import LoginPage from './LoginPage'
import EntryList from './EntryList'
import EntryEditor from './EntryEditor'
import ProjectsLayoutEditor from './ProjectsLayoutEditor'
import HomePhotosEditor from './HomePhotosEditor'
import './admin.css'

// The CMS editor at /admin. Checks the login first; everything else is behind it.
export default function AdminApp() {
  const [admin, setAdmin] = useState(undefined)   // undefined = still checking, null = logged out

  useEffect(() => {
    api.get('/api/auth/me').then(setAdmin).catch(() => setAdmin(null))
  }, [])

  if (admin === undefined) return <div className="admin-loading">Loading the editor…</div>
  if (admin === null) return <LoginPage onLoggedIn={setAdmin} />

  return (
    <div className="admin">
      <AdminHeader onLoggedOut={() => setAdmin(null)} />
      <Routes>
        <Route index element={<EntryList kind="project" title="Projects" editorPath="/admin/projects" />} />
        <Route path="projects/:id" element={<EditEntryById backTo={{ to: '/admin', label: 'All projects' }} />} />
        <Route path="case-studies" element={<EntryList kind="case_study" title="Case studies" editorPath="/admin/case-studies" />} />
        <Route path="case-studies/:id" element={<EditEntryById backTo={{ to: '/admin/case-studies', label: 'All case studies' }} />} />
        <Route path="about" element={<EntryEditor loadPath="/api/admin/pages/about" />} />
        <Route path="projects-layout" element={<ProjectsLayoutEditor />} />
        <Route path="home-photos" element={<HomePhotosEditor />} />
      </Routes>
    </div>
  )
}

function EditEntryById({ backTo }) {
  const { id } = useParams()
  return <EntryEditor key={id} loadPath={`/api/admin/entries/${id}`} backTo={backTo} />
}

function AdminHeader({ onLoggedOut }) {
  const navigate = useNavigate()

  const logOut = async () => {
    await api.post('/api/auth/logout')
    onLoggedOut()
    navigate('/admin')
  }

  return (
    <header className="admin-header">
      <NavLink to="/admin" className="admin-brand">Portfolio CMS</NavLink>
      <nav className="admin-nav">
        <NavLink to="/admin" end>Projects</NavLink>
        <NavLink to="/admin/case-studies">Case studies</NavLink>
        <NavLink to="/admin/about">About</NavLink>
        <NavLink to="/admin/projects-layout">Projects page layout</NavLink>
        <NavLink to="/admin/home-photos">Home photos</NavLink>
        <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
        <button onClick={logOut}>Log out</button>
      </nav>
    </header>
  )
}
