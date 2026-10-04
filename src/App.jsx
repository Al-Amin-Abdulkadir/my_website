import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'

import Navbar from './components/layout/Navbar'
import PageTransition from './components/layout/PageTransition'
import Intro, { shouldPlayIntro } from './components/intro/Intro'
import UnbuiltPage from './pages/UnbuiltPage'
import Projects from './pages/Projects'
import CaseStudies from './pages/CaseStudies'
import { AboutPage, CaseStudyPage, ProjectPage } from './pages/EntryPage'
import Home from './pages/Home'
import AdminApp from './admin/AdminApp'

// Two separate apps share one address:
//   /admin/*  → the CMS editor (no intro, no top bar, no page slides)
//   anything else → the public portfolio
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  )
}

// Each Directory item is its own page. Pages not built from the new designs yet
// show a plain placeholder — nothing from the old site's layout is used.
function PublicSite() {
  // The intro hands over to Home's photo cloud:
  //   'playing'   → intro on screen, the cloud waits (collapsed to its centre)
  //   'revealing' → intro photos have collapsed; the cloud grows out of the centre
  //   'done'      → intro removed
  const [introStage, setIntroStage] = useState(() => (shouldPlayIntro() ? 'playing' : 'done'))

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <ScrollToTopOnPageChange />
      {introStage !== 'done' && (
        <Intro
          onCollapsed={() => setIntroStage('revealing')}
          onFinished={() => setIntroStage('done')}
        />
      )}
      <Navbar />
      {/* PageTransition renders the page for a location — during a page change it
          shows both the old and new page and slides between them like a scroll */}
      <PageTransition
        renderPage={(location) => (
          <Routes location={location}>
            <Route path="/"                  element={<Home isWaitingForIntro={introStage === 'playing'} />} />
            <Route path="/projects"          element={<Projects />} />
            <Route path="/project/:slug"     element={<ProjectPage />} />
            <Route path="/case-studies"      element={<CaseStudies />} />
            <Route path="/case-study/:slug"  element={<CaseStudyPage />} />
            <Route path="/about"             element={<AboutPage />} />
            <Route path="/reach-out"         element={<UnbuiltPage name="Reach Out" />} />
          </Routes>
        )}
      />
    </>
  )
}

// The router keeps the old scroll position between pages; new pages should start at the top
function ScrollToTopOnPageChange() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
