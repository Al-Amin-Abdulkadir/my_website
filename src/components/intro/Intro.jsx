import { useState, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import './Intro.css'

// The opening sequence (Personal Website Redesign/UI:UX/Intro take 1–6):
// photos orbit the centre while a line of text changes; the ring speeds up on
// "Dearest Reader…" and "Welcome to my space…", collapses into the centre like
// a black hole, then explodes outward to reveal the page.

// Clockwise from the top, matching the intro designs.
// sizeScale: some frames have their tilt baked in on a bigger transparent canvas.
const PHOTOS = [
  { src: '/images/intro/sunset.webp',    alt: 'Sunlight through a window plant', sizeScale: 1 },
  { src: '/images/intro/window.webp',    alt: 'Reading by the window',           sizeScale: 712 / 600 },
  { src: '/images/intro/books.webp',     alt: 'Dostoevsky novels',               sizeScale: 696 / 600 },
  { src: '/images/intro/desk.webp',      alt: 'Desk setup at night',             sizeScale: 1 },
  { src: '/images/intro/childhood.webp', alt: 'Childhood photo',                 sizeScale: 1 },
  { src: '/images/intro/laptop.webp',    alt: 'Laptop and tablet notes',         sizeScale: 712 / 600 },
]

// What the centre line says, in order. Only the parts that change get animated.
// dotColor 'all' = the dot flashes through every colour above (see Intro.css).
const LINES = {
  creative:      { prefix: 'I am', word: 'creative',      dotColor: 'var(--dusty-blue)' },
  imaginative:   { prefix: 'I am', word: 'imaginative',   dotColor: 'var(--dusty-rose)' },
  curious:       { prefix: 'I am', word: 'curious',       dotColor: 'var(--sage-moss)' },
  keepLearning:  { prefix: 'I',    word: 'keep learning', dotColor: 'var(--washed-lilac)' },
  dearestReader: { prefix: 'Dearest Reader…' },
  welcome:       { prefix: 'Welcome to my space…',        dotColor: 'all' },
}

export default function Intro() {
  const [isPlaying, setIsPlaying] = useState(shouldPlayIntro)
  const [line, setLine] = useState(null)
  const [isTextVisible, setIsTextVisible] = useState(true)

  const backdropRef = useRef(null)
  const photoRefs = useRef([])
  const timelineRef = useRef(null)

  // Click or key press: jump to the black hole so people still see the ending
  const skipToEnding = () => {
    const timeline = timelineRef.current
    if (!timeline || timeline.time() >= timeline.labels.blackHole) return
    setIsTextVisible(false)
    timeline.seek('blackHole')
  }

  useLayoutEffect(() => {
    if (!isPlaying) return

    // All the numbers that describe the ring right now. The timeline animates
    // these; the ticker below turns them into photo positions every frame.
    const orbit = {
      angle: 0,          // degrees the whole ring has turned
      speed: 0,          // degrees per second
      radius: 1,         // 1 = the ring from the design, 0 = everything in the centre
      scale: 1,          // photo size
      selfRotation: 0,   // photos spinning on their own axis (black hole)
      opacity: 0,
    }

    const placePhotosOnRing = (time, deltaMs) => {
      orbit.angle += orbit.speed * (deltaMs / 1000)

      const isNarrow = window.innerWidth < 700
      const radiusX = window.innerWidth * (isNarrow ? 0.36 : 0.37) * orbit.radius
      const radiusY = window.innerHeight * (isNarrow ? 0.34 : 0.33) * orbit.radius

      photoRefs.current.forEach((photo, index) => {
        if (!photo) return
        // Spread the photos evenly; -100° puts the first one at the top like the design
        const angleInRadians = ((-100 + index * 60 + orbit.angle) * Math.PI) / 180
        const x = Math.cos(angleInRadians) * radiusX
        const y = Math.sin(angleInRadians) * radiusY
        photo.style.opacity = orbit.opacity
        photo.style.transform =
          `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${orbit.selfRotation}deg) scale(${orbit.scale})`
      })
    }

    const finish = () => setIsPlaying(false)

    const timeline = gsap.timeline()
    timelineRef.current = timeline

    timeline
      // Photos appear and start drifting
      .to(orbit, { opacity: 1, speed: 10, duration: 1, ease: 'power1.out' }, 0)

      // The words that describe me — only the end word and the dot change
      .call(() => setLine(LINES.creative), null, 0.4)
      .call(() => setLine(LINES.imaginative), null, 1.7)
      .call(() => setLine(LINES.curious), null, 3.0)
      .call(() => setLine(LINES.keepLearning), null, 4.3)

      // "Dearest Reader…" — the ring speeds up, then settles
      .call(() => setLine(LINES.dearestReader), null, 5.6)
      .to(orbit, { speed: 55, duration: 0.9, ease: 'power2.in' }, 5.8)
      .to(orbit, { speed: 14, duration: 1.0, ease: 'power2.out' }, 6.7)

      // "Welcome to my space…" — the dot starts flashing and the ring speeds up again…
      .call(() => setLine(LINES.welcome), null, 7.4)
      .to(orbit, { speed: 140, duration: 1.6, ease: 'power2.in' }, 7.6)

      // …and collapses into the centre like a black hole
      .addLabel('blackHole', 9.4)
      .call(() => setIsTextVisible(false), null, 'blackHole')
      .to(orbit, {
        radius: 0.03, scale: 0.08, selfRotation: 720, speed: 520,
        duration: 1.3, ease: 'power3.in',
      }, 'blackHole')

      // Then explodes outward, revealing the page underneath
      .addLabel('explode', 'blackHole+=1.3')
      .to(orbit, {
        radius: 1.7, scale: 1.7, selfRotation: 0, speed: 30,
        duration: 1.5, ease: 'power3.out',
      }, 'explode')
      // Fade the photos only once they're flying — fading from the start hides the burst
      .to(orbit, { opacity: 0, duration: 0.8, ease: 'power1.in' }, 'explode+=0.55')
      .to(backdropRef.current, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 'explode+=0.35')
      .call(finish, null, 'explode+=1.5')

    gsap.ticker.add(placePhotosOnRing)
    window.addEventListener('keydown', skipToEnding)
    document.body.style.overflow = 'hidden'

    return () => {
      timeline.kill()
      gsap.ticker.remove(placePhotosOnRing)
      window.removeEventListener('keydown', skipToEnding)
      document.body.style.overflow = ''
    }
  }, [isPlaying])

  if (!isPlaying) return null

  return (
    <div
      className="intro"
      onClick={skipToEnding}
      data-lenis-prevent
      aria-label="Intro — click to skip"
    >
      <div ref={backdropRef} className="intro__backdrop" />

      {PHOTOS.map((photo, index) => (
        <img
          key={photo.src}
          ref={(element) => { photoRefs.current[index] = element }}
          className="intro__photo"
          src={photo.src}
          alt={photo.alt}
          style={{ '--size-scale': photo.sizeScale }}
        />
      ))}

      <p className={`intro__line ${isTextVisible ? '' : 'intro__line--hidden'}`} aria-live="polite">
        {line && (
          <>
            {/* key = the text itself: when the text changes React swaps the element,
                and the new one plays its fade-up. Unchanged parts keep their key and stay put. */}
            <span key={line.prefix} className="intro__part">{line.prefix}</span>
            {line.word && <span key={line.word} className="intro__part">&nbsp;{line.word}</span>}
            {line.dotColor === 'all' && (
              <span key="all" className="intro__part intro__dot intro__dot--flashing" />
            )}
            {line.dotColor && line.dotColor !== 'all' && (
              <span key={line.dotColor} className="intro__part intro__dot" style={{ background: line.dotColor }} />
            )}
          </>
        )}
      </p>
    </div>
  )
}

// Plays on every load of the home page — except for people who've asked their
// system to reduce motion (a spinning, exploding intro can make them unwell)
function shouldPlayIntro() {
  if (window.location.pathname !== '/') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
