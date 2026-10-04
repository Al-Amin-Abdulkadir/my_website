import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { navItems } from '../../data/navigation'

// Full-screen menu: giant serif links, with one coloured dot that sits beside
// the hovered link — or the current page when nothing is hovered.
export default function DirectoryMenu({ isOpen }) {
  const location = useLocation()
  const [hoveredPath, setHoveredPath] = useState(null)
  const [dotPosition, setDotPosition] = useState(null)   // { x, y } in px inside the list
  const linkElements = useRef({})                          // path → <a> element, for measuring

  const currentPath = findCurrentNavPath(location.pathname)
  const pointedPath = hoveredPath ?? currentPath
  const pointedItem = navItems.find((item) => item.path === pointedPath)

  // A fresh menu shouldn't remember what was hovered last time
  useEffect(() => {
    if (!isOpen) setHoveredPath(null)
  }, [isOpen])

  // Measure where the pointed word sits and move the dot beside it.
  // useLayoutEffect runs before the browser paints, so the dot never flashes in the wrong spot.
  useLayoutEffect(() => {
    const placeDotBesidePointedWord = () => {
      const link = linkElements.current[pointedPath]
      if (!link) {
        setDotPosition(null)
        return
      }
      setDotPosition({
        x: link.offsetLeft,                         // left edge of the word
        y: link.offsetTop + link.offsetHeight / 2,  // vertical centre of the word
      })
    }

    placeDotBesidePointedWord()
    window.addEventListener('resize', placeDotBesidePointedWord)
    return () => window.removeEventListener('resize', placeDotBesidePointedWord)
  }, [pointedPath, isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          id="directory-menu"
          data-lenis-prevent   // stop Lenis scrolling the page behind the menu
          style={s.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <ul style={s.list} onMouseLeave={() => setHoveredPath(null)}>
            {navItems.map((item, index) => (
              <motion.li
                key={item.path}
                style={s.item}
                // Opening: quick fade-up, one row after another.
                // Closing: all rows at once and fast — leaving shouldn't make you wait.
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: 0.05 + index * 0.06, ease: [0.19, 1, 0.22, 1] }}
              >
                <Link
                  to={item.path}
                  ref={(element) => { linkElements.current[item.path] = element }}
                  style={s.link}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onFocus={() => setHoveredPath(item.path)}
                  aria-current={item.path === currentPath ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}

            {/* One dot for the whole menu. Moving it is a plain CSS transition on
                transform, so it glides between words instead of jumping. */}
            {dotPosition && (
              <span
                aria-hidden="true"
                style={{
                  ...s.dot,
                  backgroundColor: pointedItem.dotColor,
                  transform: `translate(calc(${dotPosition.x}px - 0.95em), calc(${dotPosition.y}px - 0.35em))`,
                }}
              />
            )}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

// Which menu item does this URL belong to? A project's page counts as "Projects",
// a case study's page as "Case Studies".
function findCurrentNavPath(pathname) {
  if (pathname.startsWith('/project/')) return '/projects'
  if (pathname.startsWith('/case-study/')) return '/case-studies'

  const match = navItems.find((item) => item.path === pathname)
  return match ? match.path : null
}

const MENU_FONT_SIZE = 'clamp(2.5rem, 7.4vw, 8rem)'

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 900,
    backgroundColor: 'var(--paper)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
  },
  list: {
    position: 'relative',             // the dot's coordinates are measured from here
    listStyle: 'none',
    textAlign: 'center',
    fontFamily: 'var(--font-serif)',
    fontSize: MENU_FONT_SIZE,         // set on the list so the dot's "em" sizes match the words
  },
  item: {
    lineHeight: 1.12,
  },
  link: {
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.01em',
    color: 'var(--ink)',
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '0.7em',
    height: '0.7em',
    borderRadius: '50%',
    pointerEvents: 'none',
    transition: 'transform 0.5s var(--ease-out-expo), background-color 0.4s ease',
    animation: 'fadeIn 0.5s ease 0.25s both',   // appear after the words have started rising
  },
}
