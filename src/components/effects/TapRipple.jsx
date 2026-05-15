import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function TapRipple() {
  const canvasRef = useRef(null)
  const location  = useLocation()
  const isLight   = location.pathname === '/firststepmedia'

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const rings  = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onTouch = (e) => {
      for (const touch of e.changedTouches) {
        rings.push({
          x:       touch.clientX,
          y:       touch.clientY,
          radius:  0,
          opacity: isLight ? 0.35 : 0.45,
        })
      }
    }
    window.addEventListener('touchstart', onTouch, { passive: true })

    const rgb = isLight ? '10,10,10' : '218,212,200'
    let rafId

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]
        r.radius  += 4.5
        r.opacity -= 0.012

        if (r.opacity <= 0) { rings.splice(i, 1); continue }

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rgb},${r.opacity})`
        ctx.lineWidth   = 1.5
        ctx.stroke()

        if (r.radius > 30) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius - 18, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${rgb},${r.opacity * 0.5})`
          ctx.lineWidth   = 1
          ctx.stroke()
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('touchstart', onTouch)
    }
  }, [isLight])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:          0,
        zIndex:         3,
        pointerEvents: 'none',
        display:       'block',
      }}
    />
  )
}
