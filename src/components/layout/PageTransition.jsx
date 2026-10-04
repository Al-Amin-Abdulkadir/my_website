import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import './PageTransition.css'

// Page changes look like one continuous scroll (as on gionatannese.com):
// the old page and the new page are stacked in a column, and the stack slides
// up by one screen height — or down, when going back to an earlier page.
//
// `renderPage(location)` returns the page for a location. We call it twice
// during a transition: once for the new page, once for the old one.

// Pages in "scroll order". Going to a later page slides down; an earlier one, up.
const PAGE_ORDER = ['/', '/projects', '/project/', '/case-studies', '/case-study/', '/about', '/reach-out']

export default function PageTransition({ renderPage }) {
  const location = useLocation()
  const [previous, setPrevious] = useState(null)   // { location, scrollY, direction } while sliding
  const shownLocationRef = useRef(location)
  const trackRef = useRef(null)
  const lastScrollYRef = useRef(0)

  // Keep a running record of the scroll position. We can't just read window.scrollY
  // when the page changes: by then the new (maybe shorter) page is already in, and
  // the browser has clamped the scroll position to fit it.
  useEffect(() => {
    const rememberScroll = () => { lastScrollYRef.current = window.scrollY }
    window.addEventListener('scroll', rememberScroll, { passive: true })
    return () => window.removeEventListener('scroll', rememberScroll)
  }, [])

  // A new location arrived: remember the page we're leaving and how far down it was.
  // (Runs before the browser paints, so the new page never flashes on its own.)
  useLayoutEffect(() => {
    const leaving = shownLocationRef.current
    if (leaving.pathname === location.pathname) return
    shownLocationRef.current = location

    gsap.killTweensOf(trackRef.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setPrevious({
      location: leaving,
      scrollY: lastScrollYRef.current,
      direction: orderOf(location.pathname) >= orderOf(leaving.pathname) ? 1 : -1,
    })
  }, [location])

  // Slide the stack by one screen height, then drop the old page
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!previous) {
      gsap.set(track, { clearProps: 'transform' })
      return
    }
    const screenHeight = window.innerHeight
    const isGoingDown = previous.direction > 0

    gsap.fromTo(track,
      { y: isGoingDown ? 0 : -screenHeight },
      { y: isGoingDown ? -screenHeight : 0, duration: 1.2, ease: 'expo.inOut', onComplete: () => setPrevious(null) },
    )
  }, [previous])

  const oldPage = previous && (
    <div key="previous" className="page-panel page-panel--clipped" aria-hidden="true">
      {/* Shifted by the old scroll position, so it shows exactly what you were looking at */}
      <div style={{ transform: `translateY(${-previous.scrollY}px)` }}>
        {renderPage(previous.location)}
      </div>
    </div>
  )

  return (
    <div ref={trackRef} className={previous ? 'page-track page-track--sliding' : 'page-track'}>
      {previous?.direction > 0 && oldPage}
      {/* Same key every time, so React keeps the current page alive when the
          old page is added or removed around it */}
      <div key="current" className={previous ? 'page-panel page-panel--clipped' : 'page-panel'}>
        {renderPage(location)}
      </div>
      {previous?.direction < 0 && oldPage}
    </div>
  )
}

export function orderOf(pathname) {
  const index = PAGE_ORDER.findIndex((path) =>
    path.endsWith('/') && path !== '/' ? pathname.startsWith(path) : pathname === path)
  return index === -1 ? 0 : index
}
