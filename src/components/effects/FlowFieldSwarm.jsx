import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

function flowAngle(x, y, t) {
  return (
    Math.sin(x * 0.0025 + t * 0.4) * Math.cos(y * 0.002 + t * 0.3) +
    Math.sin(x * 0.005 - t * 0.25) * Math.cos(y * 0.004 + t * 0.35) * 0.5
  ) * Math.PI * 2
}

export default function FlowFieldSwarm() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const location  = useLocation()
  const isLight   = location.pathname === '/firststepmedia'

  useEffect(() => {
    const canvas  = canvasRef.current
    const ctx     = canvas.getContext('2d')
    const mobile  = isTouch()
    const COUNT   = mobile ? 70 : 130
    const RADIUS  = mobile ? 90 : 140
    const FORCE   = mobile ? 1.8 : 2.8

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove  = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onLeave = ()  => { mouseRef.current = { x: -9999, y: -9999 } }
    const onTouch = (e) => { mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchEnd = () => { mouseRef.current = { x: -9999, y: -9999 } }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    const particles = Array.from({ length: COUNT }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vx:      0,
      vy:      0,
      size:    Math.random() * 1.6 + 0.6,
      opacity: Math.random() * 0.35 + 0.12,
    }))

    const rgb = isLight ? '10,10,10' : '218,212,200'
    let t = 0
    let rafId

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.007

      const { x: mx, y: my } = mouseRef.current

      for (const p of particles) {
        const angle = flowAngle(p.x, p.y, t)
        p.vx += Math.cos(angle) * 0.06
        p.vy += Math.sin(angle) * 0.06

        const dx   = p.x - mx
        const dy   = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < RADIUS && dist > 0) {
          const f = ((RADIUS - dist) / RADIUS) * FORCE
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f
        }

        p.vx *= 0.91
        p.vy *= 0.91
        p.x  += p.vx
        p.y  += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${p.opacity})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
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
