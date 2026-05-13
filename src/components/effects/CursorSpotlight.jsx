import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const RADIUS   = 320
const LERP     = 0.09
const DIM_DARK = 0.68   // how much to dim outside spotlight on dark pages
const DIM_LIGHT = 0.22  // how much to dim outside spotlight on light pages

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export default function CursorSpotlight() {
  if (isTouch()) return null
  const overlayRef  = useRef(null)
  const targetRef   = useRef({ x: -1000, y: -1000 })
  const currentRef  = useRef({ x: -1000, y: -1000 })
  const activeRef   = useRef(false)
  const rafRef      = useRef(null)
  const location    = useLocation()
  const isLight     = location.pathname === '/firststepmedia'

  useEffect(() => {
    const overlay = overlayRef.current

    const dimColor = isLight
      ? `rgba(10, 10, 10, ${DIM_LIGHT})`
      : `rgba(6, 6, 6,   ${DIM_DARK})`

    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      if (!activeRef.current) {
        currentRef.current = { x: e.clientX, y: e.clientY }
        activeRef.current  = true
        overlay.style.opacity = '1'
      }
    }

    const onLeave = () => {
      activeRef.current    = false
      overlay.style.opacity = '0'
    }

    const onEnter = () => {
      activeRef.current    = true
      overlay.style.opacity = '1'
    }

    window.addEventListener('mousemove',   onMove,  { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    const tick = () => {
      const t = targetRef.current
      const c = currentRef.current

      c.x += (t.x - c.x) * LERP
      c.y += (t.y - c.y) * LERP

      overlay.style.background =
        `radial-gradient(circle ${RADIUS}px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px, transparent 0%, ${dimColor} 100%)`

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove',   onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isLight])

  return (
    <div
      ref={overlayRef}
      style={{
        position:      'fixed',
        inset:          0,
        zIndex:         500,
        pointerEvents: 'none',
        opacity:        0,
        transition:    'opacity 0.5s ease',
        willChange:    'background',
      }}
    />
  )
}
