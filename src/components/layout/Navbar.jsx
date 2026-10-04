import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DirectoryMenu from './DirectoryMenu'

// Top bar from the designs: Search on the left, Directory (menu) on the right.
// Owns the open/closed state of the full-screen Directory menu.
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Navigating to a page should always close the menu
  useEffect(() => { setIsMenuOpen(false) }, [location.pathname])

  // Freeze the page behind the menu, and let Escape close it
  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMenuOpen])

  return (
    <>
      <header style={s.bar}>
        {/* Search is hidden while the menu is open (matches the menu designs).
            For now it just leads to Projects; Phase 5 turns it into a real filter. */}
        {isMenuOpen ? <span /> : (
          <Link to="/projects" style={s.control} aria-label="Search projects">
            <SearchIcon />
            <span style={s.label}>Search</span>
          </Link>
        )}

        <button
          onClick={() => setIsMenuOpen((wasOpen) => !wasOpen)}
          style={s.control}
          aria-expanded={isMenuOpen}
          aria-controls="directory-menu"
        >
          <DirectoryIcon isOpen={isMenuOpen} />
          <span style={s.label}>Directory</span>
        </button>
      </header>

      <DirectoryMenu isOpen={isMenuOpen} />
    </>
  )
}

// Rounded square with a bar inside: bar at the top = closed, bar at the bottom = open
function DirectoryIcon({ isOpen }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <line
        x1="6.5" x2="17.5" y1="6.5" y2="6.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        style={{
          transform: isOpen ? 'translateY(11px)' : 'translateY(0)',
          transition: 'transform 0.45s var(--ease-out-expo)',
        }}
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="1.8" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const s = {
  bar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,                      // above the Directory menu, so the toggle stays clickable
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '28px clamp(20px, 2vw, 32px)',
    pointerEvents: 'none',             // the empty middle of the bar shouldn't block clicks…
  },
  control: {
    pointerEvents: 'auto',             // …but the two controls should
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--ink)',
  },
  label: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.95rem',
    lineHeight: 1,
  },
}
