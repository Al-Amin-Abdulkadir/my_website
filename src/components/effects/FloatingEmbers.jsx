import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const COUNT      = 50
const BASE_SPEED = 0.35

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

function spawnEmber(w, h, isLight) {
  const maxOpacity = isLight
    ? 0.08 + Math.random() * 0.08
    : 0.25 + Math.random() * 0.2

  return {
    x:          Math.random() * w,
    y:          h + Math.random() * 80,
    size:       Math.random() * 1.8 + 0.4,
    opacity:    0,
    maxOpacity,
    speed:      BASE_SPEED + Math.random() * 0.45,
    drift:      (Math.random() - 0.5) * 0.35,
    driftAngle: Math.random() * Math.PI * 2,
    driftSpeed: 0.018 + Math.random() * 0.022,
    fadingIn:   true,
  }
}

export default function FloatingEmbers() {
  const canvasRef = useRef(null)
  const location  = useLocation()
  const isLight   = location.pathname === '/firststepmedia'

  if (isTouch()) return null

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Seed embers distributed across the full canvas height on load
    const embers = Array.from({ length: COUNT }, () => {
      const e = spawnEmber(canvas.width, canvas.height, isLight)
      e.y       = Math.random() * canvas.height
      e.opacity = Math.random() * e.maxOpacity
      e.fadingIn = false
      return e
    })

    const rgb = isLight ? '10,10,10' : '238,232,220'

    let rafId
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const e of embers) {
        e.y           -= e.speed
        e.driftAngle  += e.driftSpeed
        e.x           += Math.sin(e.driftAngle) * e.drift

        if (e.fadingIn) {
          e.opacity += 0.006
          if (e.opacity >= e.maxOpacity) { e.opacity = e.maxOpacity; e.fadingIn = false }
        } else if (e.y < canvas.height * 0.25) {
          e.opacity -= 0.005
        }

        if (e.opacity <= 0 || e.y < -8) {
          Object.assign(e, spawnEmber(canvas.width, canvas.height, isLight))
        }

        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${e.opacity.toFixed(3)})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [isLight])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:          0,
        zIndex:         2,
        pointerEvents: 'none',
        display:       'block',
      }}
    />
  )
}
