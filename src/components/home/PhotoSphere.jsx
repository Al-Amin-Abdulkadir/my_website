import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import './PhotoSphere.css'

// A 3D cloud of floating photos (inspired by gionatannese.com — see
// Personal Website Redesign/IMG_6395.jpg). Photos are scattered through a ball
// of space and always face you; near ones are bigger and in front, far ones
// smaller and behind. Drag or scroll to turn the cloud in any direction — it
// keeps gliding when you let go. Click a photo to bring it forward with its
// caption; click again (or Escape) to send it back.

const CAMERA_DISTANCE = 3.2    // how far the viewer stands from the centre, in cloud radii.
                               // Smaller = stronger size difference between near and far.
const DRAG_SPEED = 0.005       // radians of turn per pixel dragged
const WHEEL_SPEED = 0.0006     // radians of turn per pixel scrolled
const FRICTION = 0.94          // each frame the spin keeps 94% of its speed (value from gionatannese)
const IDLE_SPIN = 0.0012       // gentle drift, radians per frame, so it never looks frozen
const CLICK_TOLERANCE = 6      // moving less than this many px between press and release = a click

export default function PhotoSphere({ photos, isWaitingForIntro = false }) {
  const sphereRef = useRef(null)
  const tileRefs = useRef([])
  const isPausedRef = useRef(false)
  const [focused, setFocused] = useState(null)   // { photo, fromRect } while a photo is forward
  // 0 = the whole cloud squeezed into its centre point, 1 = fully spread out.
  // Starts at 0 while the intro plays, then grows when the intro hands over.
  const spreadRef = useRef({ value: isWaitingForIntro ? 0 : 1 })

  const tiles = useMemo(() => buildTiles(photos), [photos])

  useEffect(() => {
    if (isWaitingForIntro || spreadRef.current.value === 1) return
    gsap.to(spreadRef.current, { value: 1, duration: 1.8, ease: 'expo.out' })
  }, [isWaitingForIntro])

  useEffect(() => {
    const sphere = sphereRef.current
    let orientation = IDENTITY            // how the whole cloud is turned right now
    let layout = null                     // screen centre + sizes, measured on load and resize
    let velocity = { x: 0, y: 0 }         // current spin, radians per frame
    let drag = null                       // set while the pointer is held down
    let lastPressWasDrag = false          // so the click after a drag doesn't open a photo

    const turn = (angleX, angleY) => {
      orientation = orthonormalize(multiply(rotationX(angleX), multiply(rotationY(angleY), orientation)))
    }

    // Sizes depend on the screen, so they're measured on load and on resize
    const measure = () => {
      const box = sphere.getBoundingClientRect()
      const isNarrow = box.width < 700
      const radius = Math.min(box.width, box.height) * (isNarrow ? 0.36 : 0.38)
      // Fill the screen's shape: wider than tall on laptops, taller than wide on phones
      const stretchX = Math.min(Math.max(box.width / box.height, 1), 1.5)
      const stretchY = Math.min(Math.max(box.height / box.width, 1), 1.6)
      layout = { centerX: box.width / 2, height: box.height, radius, stretchX, stretchY }
      // Fewer photos → bigger photos, so a small set still fills the space
      const sizeForCount = Math.min(1.5, Math.max(1, 14 / tiles.length))
      sphere.style.setProperty('--tile-size', `${radius * (isNarrow ? 0.4 : 0.3) * sizeForCount}px`)
    }

    // Every frame: turn each photo's 3D point, then project it onto the screen.
    // Perspective: scale = camera distance ÷ (camera distance − depth), so a point
    // coming towards you (positive depth) grows and one going away shrinks.
    const render = () => {
      const { centerX, height, radius, stretchX, stretchY } = layout
      const cameraDistance = CAMERA_DISTANCE * radius
      const spread = spreadRef.current.value
      // The intro collapses at the screen's middle (50%); the cloud rests a touch lower
      // (53%), so it drifts down slightly as it grows
      const centerY = height * (0.5 + 0.03 * spread)

      tiles.forEach((tile, index) => {
        const [x, y, z] = applyRotation(orientation, tile.position).map((value) => value * radius * spread)
        const scale = (cameraDistance / (cameraDistance - z)) * (0.1 + 0.9 * spread)
        const nearness = (z / radius + 1) / 2                 // 0 = farthest back, 1 = nearest

        const element = tileRefs.current[index]
        element.style.transform =
          `translate(${centerX + x * stretchX * scale}px, ${centerY + y * stretchY * scale}px) translate(-50%, -50%) scale(${scale})`
        element.style.zIndex = Math.round(nearness * 1000)    // near photos cover far ones
        element.style.opacity = Math.min(1, spread * 3)
      })
    }

    const tick = (time, deltaMs) => {
      const frames = deltaMs / (1000 / 60)          // keeps speed the same on 60Hz and 120Hz screens
      if (!isPausedRef.current && !drag) {
        turn(velocity.x * frames, (velocity.y + IDLE_SPIN) * frames)
        velocity.x *= FRICTION ** frames
        velocity.y *= FRICTION ** frames
      }
      render()
    }

    const onPointerDown = (event) => {
      if (isPausedRef.current) return
      drag = {
        startX: event.clientX, startY: event.clientY,
        lastX: event.clientX, lastY: event.clientY,
        lastMoveTime: performance.now(),
      }
      velocity = { x: 0, y: 0 }
    }

    const onPointerMove = (event) => {
      if (!drag) return
      // Dragging right turns the front of the sphere right; dragging down turns it down
      const angleX = -(event.clientY - drag.lastY) * DRAG_SPEED
      const angleY = (event.clientX - drag.lastX) * DRAG_SPEED
      turn(angleX, angleY)
      velocity = { x: angleX, y: angleY }
      drag.lastX = event.clientX
      drag.lastY = event.clientY
      drag.lastMoveTime = performance.now()
    }

    const onPointerUp = (event) => {
      if (!drag) return
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
      const heldStillBeforeRelease = performance.now() - drag.lastMoveTime > 80
      if (heldStillBeforeRelease) velocity = { x: 0, y: 0 }   // no fling if the hand stopped first

      lastPressWasDrag = distance >= CLICK_TOLERANCE
      drag = null
    }

    // Photos open on `click`, not `pointerup`: on phones the click arrives a moment
    // after pointerup, and would land on the just-opened photo and close it again.
    const onClick = (event) => {
      const tileIndex = event.target.dataset.tileIndex
      if (lastPressWasDrag || tileIndex === undefined || isPausedRef.current) return
      isPausedRef.current = true
      setFocused({ photo: tiles[tileIndex].photo, fromRect: event.target.getBoundingClientRect() })
    }

    const onWheel = (event) => {
      event.preventDefault()   // the wheel spins the sphere instead of scrolling
      if (isPausedRef.current) return
      velocity.x += -event.deltaY * WHEEL_SPEED
      velocity.y += -event.deltaX * WHEEL_SPEED
    }

    measure()
    render()
    gsap.ticker.add(tick)
    window.addEventListener('resize', measure)
    sphere.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    sphere.addEventListener('wheel', onWheel, { passive: false })
    sphere.addEventListener('click', onClick)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', measure)
      sphere.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      sphere.removeEventListener('wheel', onWheel)
      sphere.removeEventListener('click', onClick)
    }
  }, [tiles])

  const unfocus = () => {
    setFocused(null)
    isPausedRef.current = false
  }

  return (
    <>
      <div ref={sphereRef} className="sphere" data-lenis-prevent>
        {tiles.map((tile, index) => (
          <Media
            key={index}
            mediaRef={(element) => { tileRefs.current[index] = element }}
            className="sphere__tile"
            src={tile.photo.src}
            alt={tile.photo.alt}
            data-tile-index={index}
          />
        ))}
      </div>

      {focused && <FocusedPhoto photo={focused.photo} fromRect={focused.fromRect} onClosed={unfocus} />}
    </>
  )
}

// The clicked photo flies from its spot on the sphere to the centre, caption underneath
function FocusedPhoto({ photo, fromRect, onClosed }) {
  const backdropRef = useRef(null)
  const imageRef = useRef(null)
  const captionRef = useRef(null)
  const isClosingRef = useRef(false)

  const size = Math.min(window.innerHeight * 0.56, window.innerWidth * 0.78)
  const target = {
    left: (window.innerWidth - size) / 2,
    top: (window.innerHeight - size) / 2 - 28,   // nudged up to leave room for the caption
    width: size,
    height: size,
  }
  const start = { left: fromRect.left, top: fromRect.top, width: fromRect.width, height: fromRect.height }

  useLayoutEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    gsap.fromTo(imageRef.current, start, { ...target, duration: 0.8, ease: 'expo.out' })
    gsap.fromTo(captionRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.35, ease: 'power2.out' })
  }, [])

  const close = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    gsap.to(captionRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.5, delay: 0.1 })
    gsap.to(imageRef.current, { ...start, duration: 0.6, ease: 'power3.inOut', onComplete: onClosed })
  }

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <div className="photo-focus" onClick={close} role="dialog" aria-label={photo.alt}>
      <div ref={backdropRef} className="photo-focus__backdrop" />
      <Media mediaRef={imageRef} className="photo-focus__image" src={photo.src} alt={photo.alt} />
      <p
        ref={captionRef}
        className={`photo-focus__caption ${photo.caption ? '' : 'photo-focus__caption--missing'}`}
        style={{ top: target.top + target.height + 24 }}
      >
        {photo.caption ?? 'Caption coming soon'}
        {photo.link && (
          // stopPropagation: following the link shouldn't also close the photo
          <a className="photo-focus__link" href={photo.link.url} onClick={(event) => event.stopPropagation()}>
            {photo.link.label} →
          </a>
        )}
      </p>
    </div>
  )
}

// A photo — or a video, which plays silently on loop like a moving photo
function Media({ src, alt, mediaRef, ...rest }) {
  if (/\.(mp4|webm|mov)$/i.test(src)) {
    return <video ref={mediaRef} src={src} aria-label={alt} autoPlay muted loop playsInline draggable={false} {...rest} />
  }
  return <img ref={mediaRef} src={src} alt={alt} draggable={false} {...rest} />
}

// ── Sphere maths ────────────────────────────────────────────────────────────

// One tile per photo (no repeats). Spread the points evenly in every direction
// (the "Fibonacci sphere" — like sunflower seeds), then push each one a different
// distance from the centre so they form a scattered cloud rather than a neat shell.
function buildTiles(photos) {
  const count = photos.length
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  return photos.map((photo, index) => {
    const y = 1 - (2 * (index + 0.5)) / count          // from top (1) to bottom (-1)
    const ringRadius = Math.sqrt(1 - y * y)
    const angle = index * goldenAngle
    const distance = 0.7 + 0.3 * steadyRandom(index)   // 0.7–1.0 of the radius: scattered, but the middle breathes
    return {
      photo,
      position: [Math.cos(angle) * ringRadius * distance, y * distance, Math.sin(angle) * ringRadius * distance],
    }
  })
}

// A "random" number between 0 and 1 that is the same for the same index on every
// load — so the cloud always has the same shape instead of reshuffling on refresh.
function steadyRandom(index) {
  const value = Math.sin(index * 12.9898 + 4.1414) * 43758.5453
  return value - Math.floor(value)
}

function applyRotation(m, [x, y, z]) {
  return [
    m[0][0] * x + m[0][1] * y + m[0][2] * z,
    m[1][0] * x + m[1][1] * y + m[1][2] * z,
    m[2][0] * x + m[2][1] * y + m[2][2] * z,
  ]
}

// Orientation is a 3×3 rotation matrix. Each drag applies a small turn *as seen
// on screen*, so the cloud always moves the way you drag — even upside down.
const IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

function rotationX(angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [[1, 0, 0], [0, c, -s], [0, s, c]]
}

function rotationY(angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]]
}

function multiply(a, b) {
  return a.map((row) => [0, 1, 2].map((column) =>
    row[0] * b[0][column] + row[1] * b[1][column] + row[2] * b[2][column]))
}

// Thousands of tiny multiplications slowly bend the matrix out of shape (rounding
// errors). Re-straightening it every frame keeps the sphere from warping over time.
function orthonormalize([r0, r1]) {
  const normalize = (v) => { const l = Math.hypot(...v); return v.map((n) => n / l) }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const row0 = normalize(r0)
  const row2 = normalize(cross(row0, r1))
  const row1 = cross(row2, row0)
  return [row0, row1, row2]
}
