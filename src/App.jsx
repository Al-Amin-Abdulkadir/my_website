import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'

import CustomCursor from './components/cursor/CustomCursor'
import FloatingEmbers from './components/effects/FloatingEmbers'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Work from './components/sections/Work'
import Skills from './components/sections/Skills'
import Contact from './components/sections/Contact'
import FirstStepMedia from './pages/FirstStepMedia'
import ProjectDetail from './pages/ProjectDetail'

function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Skills />
      <Contact />
    </main>
  )
}

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
      <CustomCursor />
      <FloatingEmbers />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/firststepmedia" element={<FirstStepMedia />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
