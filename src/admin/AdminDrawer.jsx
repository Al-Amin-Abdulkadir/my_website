import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from './api'

// The CMS menu: a Directory button in the header opens a drawer from the right.
// Inside the icon a vertical line slides across (x-axis) as the drawer opens —
// the editor's version of the site's Directory icon, whose line slides down.
const LINKS = [
  // Projects is "current" on the list (/admin) and while editing one (/admin/projects/…)
  { to: '/admin', label: 'Projects', isCurrent: (path) => path === '/admin' || path.startsWith('/admin/projects/') },
  { to: '/admin/explore', label: 'Explore' },
  { to: '/admin/about', label: 'About' },
  { to: '/admin/projects-layout', label: 'Projects page layout' },
  { to: '/admin/home-photos', label: 'Home photos' },
  { to: '/admin/colors', label: 'Site colours' },
]

export default function AdminDrawer({ onLoggedOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Choosing a page closes the drawer
  useEffect(() => { setIsOpen(false) }, [location.pathname])

  // Escape closes it too
  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event) => { if (event.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const logOut = async () => {
    try {
      await api.post('/api/auth/logout')
      onLoggedOut()
      navigate('/admin')
    } catch (problem) {
      window.alert(`Couldn’t log out: ${problem.message}`)
    }
  }

  return (
    <>
      <button
        className="drawer-toggle"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-expanded={isOpen}
        aria-controls="admin-drawer"
      >
        <DrawerIcon isOpen={isOpen} />
        <span>Directory</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.nav
              id="admin-drawer"
              className="drawer"
              aria-label="CMS menu"
              data-lenis-prevent
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            >
              <ul className="drawer__links">
                {LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) => {
                        const isCurrent = link.isCurrent ? link.isCurrent(location.pathname) : isActive
                        return isCurrent ? 'drawer__link active' : 'drawer__link'
                      }}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="drawer__footer">
                <a href="/" target="_blank" rel="noreferrer" className="drawer__small-link">View site ↗</a>
                <button onClick={logOut} className="drawer__small-link">Log out</button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Rounded square with a vertical line: line on the left = closed, on the right = open
function DrawerIcon({ isOpen }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <line
        x1="6.5" x2="6.5" y1="6.5" y2="17.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        style={{
          transform: isOpen ? 'translateX(11px)' : 'translateX(0)',
          transition: 'transform 0.45s var(--ease-out-expo)',
        }}
      />
    </svg>
  )
}
