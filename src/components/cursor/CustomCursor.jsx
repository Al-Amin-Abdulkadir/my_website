import { useEffect, useRef } from 'react'
import useMousePosition from '../../hooks/useMousePosition'

const styles = {
  dot: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--white)',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease',
  },
  ring: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid rgba(240,240,240,0.5)',
    pointerEvents: 'none',
    zIndex: 9998,
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
  },
}

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export default function CustomCursor() {
  if (isTouch()) return null
  const { position, isHovering } = useMousePosition()
  const ringRef = useRef(null)
  const ringPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    const lerp = (start, end, t) => start + (end - start) * t

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, position.x, 0.12)
      ringPos.current.y = lerp(ringPos.current.y, position.y, 0.12)
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`
        ringRef.current.style.top  = `${ringPos.current.y}px`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [position])

  const dotStyle = {
    ...styles.dot,
    left: `${position.x}px`,
    top:  `${position.y}px`,
    width:  isHovering ? '12px' : '8px',
    height: isHovering ? '12px' : '8px',
    mixBlendMode: 'difference',
  }

  const ringStyle = {
    ...styles.ring,
    width:  isHovering ? '56px' : '36px',
    height: isHovering ? '56px' : '36px',
    borderColor: isHovering ? 'rgba(240,240,240,0.9)' : 'rgba(240,240,240,0.5)',
    mixBlendMode: 'difference',
  }

  return (
    <>
      <div style={dotStyle} />
      <div ref={ringRef} style={ringStyle} />
    </>
  )
}
