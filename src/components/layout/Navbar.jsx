import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MagneticButton from '../ui/MagneticButton'
import useScrollProgress from '../../hooks/useScrollProgress'
import useIsMobile from '../../hooks/useIsMobile'

const links = ['Work', 'About', 'Skills', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [menuOpen, setMenuOpen]   = useState(false)
  const progress  = useScrollProgress()
  const location  = useLocation()
  const isMobile  = useIsMobile()
  const isLight   = location.pathname === '/firststepmedia'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    }, 320)
  }

  const col = {
    logo:        isLight ? '#0a0a0a'                   : 'var(--white)',
    link:        isLight ? '#444'                       : 'var(--grey-4)',
    linkHover:   isLight ? '#0a0a0a'                   : 'var(--white)',
    navBg:       isLight ? 'rgba(247,247,245,0.92)'    : 'rgba(8,8,8,0.85)',
    border:      isLight ? '1px solid #d0d0d0'         : '1px solid var(--grey-2)',
    progressBar: isLight ? '#0a0a0a'                   : 'var(--white)',
    burger:      isLight ? '#0a0a0a'                   : 'var(--white)',
  }

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        backgroundColor: scrolled ? col.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? col.border : '1px solid transparent',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}>
        <MagneticButton href="/">
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: col.logo,
            textDecoration: 'none',
          }}>AA</span>
        </MagneticButton>

        {/* Desktop nav */}
        {!isMobile && (
          <ul style={{ display: 'flex', alignItems: 'center', gap: '36px', listStyle: 'none' }}>
            {links.map((link) => (
              <li key={link}>
                <MagneticButton
                  onClick={() => scrollTo(link)}
                  onMouseEnter={() => setHoveredLink(link)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: hoveredLink === link ? col.linkHover : col.link,
                    transition: 'color 0.2s ease',
                    textDecoration: 'none',
                  }}>{link}</span>
                </MagneticButton>
              </li>
            ))}
            <li>
              <MagneticButton
                onMouseEnter={() => setHoveredLink('fsm')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Link to="/firststepmedia" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: hoveredLink === 'fsm' ? col.linkHover : col.link,
                  transition: 'color 0.2s ease',
                  textDecoration: 'none',
                }}>FSM</Link>
              </MagneticButton>
            </li>
          </ul>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              zIndex: 1100,
            }}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                backgroundColor: col.burger,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: menuOpen
                  ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                  : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'none'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        )}

        {/* Scroll progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          height: '1px',
          width: `${progress * 100}%`,
          backgroundColor: col.progressBar,
          transition: 'width 0.1s linear',
        }} />
      </nav>

      {/* Mobile full-screen menu */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          backgroundColor: isLight ? '#f7f7f5' : '#080808',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}>
          {links.map((link, i) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: isLight ? '#0a0a0a' : 'var(--white)',
                cursor: 'pointer',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.3s ease ${i * 0.06}s, transform 0.3s ease ${i * 0.06}s`,
              }}
            >
              {link}
            </button>
          ))}
          <Link
            to="/firststepmedia"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(2rem, 8vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: isLight ? '#888' : 'var(--grey-4)',
              textDecoration: 'none',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.3s ease ${links.length * 0.06}s, transform 0.3s ease ${links.length * 0.06}s`,
            }}
          >
            FSM
          </Link>
        </div>
      )}
    </>
  )
}
