import { useState, useEffect } from 'react'

export default function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const onMove = (e) => setPosition({ x: e.clientX, y: e.clientY })

    const onEnterLink = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setIsHovering(true)
    }
    const onLeaveLink = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setIsHovering(false)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnterLink)
    document.addEventListener('mouseout', onLeaveLink)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnterLink)
      document.removeEventListener('mouseout', onLeaveLink)
    }
  }, [])

  return { position, isHovering }
}
