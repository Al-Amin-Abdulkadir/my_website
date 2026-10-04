import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'

import Navbar from './components/layout/Navbar'
import Intro from './components/intro/Intro'
import UnbuiltPage from './pages/UnbuiltPage'
import Projects from './pages/Projects'

// Each Directory item is its own page. Pages not built from the new designs yet
// show a plain placeholder — nothing from the old site's layout is used.
export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTopOnPageChange />
      <Intro />
      <Navbar />
      <Routes>
        <Route path="/"             element={<UnbuiltPage name="Home" />} />
        <Route path="/projects"     element={<Projects />} />
        <Route path="/case-studies" element={<UnbuiltPage name="Case Studies" />} />
        <Route path="/about"        element={<UnbuiltPage name="About Me" />} />
        <Route path="/reach-out"    element={<UnbuiltPage name="Reach Out" />} />
        <Route path="/project/:id"  element={<UnbuiltPage name="Project" />} />
      </Routes>
    </BrowserRouter>
  )
}

// The router keeps the old scroll position between pages; new pages should start at the top
function ScrollToTopOnPageChange() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
