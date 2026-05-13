import { useEffect, useRef } from 'react'

export default function ChromaticAberration() {
  const intensityRef = useRef(0)
  const targetRef    = useRef(0)
  const lastScrollY  = useRef(window.scrollY)
  const rafRef       = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current)
      lastScrollY.current = window.scrollY
      targetRef.current = Math.min(delta * 0.5, 12)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      intensityRef.current += (targetRef.current - intensityRef.current) * 0.14
      targetRef.current    *= 0.82

      const i = intensityRef.current
      const alpha = Math.min(i / 10, 0.85)

      document.documentElement.style.setProperty('--ca-pos',   `${i.toFixed(2)}px`)
      document.documentElement.style.setProperty('--ca-neg',   `${(-i).toFixed(2)}px`)
      document.documentElement.style.setProperty('--ca-alpha', alpha.toFixed(3))

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
      document.documentElement.style.removeProperty('--ca-pos')
      document.documentElement.style.removeProperty('--ca-neg')
      document.documentElement.style.removeProperty('--ca-alpha')
    }
  }, [])

  return null
}
