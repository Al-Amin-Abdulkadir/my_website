import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DirectoryMenu from './DirectoryMenu'
import SearchPanel from './SearchPanel'

// Top bar from the designs: Search on the left, Directory (menu) on the right.
// Only one panel can be open at a time, so one value tracks it:
// null (nothing open), 'menu' or 'search'.
export default function Navbar() {
  const [openPanel, setOpenPanel] = useState(null)
  const location = useLocation()
  const isMenuOpen = openPanel === 'menu'
  const isSearchOpen = openPanel === 'search'

  const toggle = (panel) => setOpenPanel((current) => (current === panel ? null : panel))
  const close = () => setOpenPanel(null)

  // Navigating to a page should always close whatever is open
  useEffect(() => { setOpenPanel(null) }, [location.pathname])

  // Freeze the page behind an open panel, and let Escape close it
  useEffect(() => {
    if (!openPanel) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [openPanel])

  return (
    <>
      <header style={s.bar}>
        {/* Search is hidden while the menu is open (matches the menu designs) */}
        {isMenuOpen ? <span /> : (
          <button
            onClick={() => toggle('search')}
            style={s.control}
            aria-expanded={isSearchOpen}
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
          >
            <SearchIcon />
            <span style={s.label}>{isSearchOpen ? 'Close' : 'Search'}</span>
          </button>
        )}

        <button
          onClick={() => toggle('menu')}
          style={s.control}
          aria-expanded={isMenuOpen}
          aria-controls="directory-menu"
        >
          <DirectoryIcon isOpen={isMenuOpen} />
          <span style={s.label}>Directory</span>
        </button>
      </header>

      <SearchPanel isOpen={isSearchOpen} onClose={close} />
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
