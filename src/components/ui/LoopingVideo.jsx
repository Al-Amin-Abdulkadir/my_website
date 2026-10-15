import { useEffect, useRef } from 'react'

// A video that plays silently on loop like a moving photo: project covers on the
// Projects page and pieces on the Explore page.

// Plays only while on screen: a page of looping videos would otherwise keep every
// one of them running (and draining a phone's battery) after you scroll past.
// With shouldPlay off (reduced motion) it just shows its first frame.
export default function LoopingVideo({ src, poster, label, className, style, shouldPlay }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!shouldPlay) return
    const video = videoRef.current
    const observer = new IntersectionObserver(([sighting]) => {
      if (sighting.isIntersecting) {
        // An iPhone in Low Power Mode refuses to autoplay. That's fine: the
        // poster (the first frame) stays, like a photo.
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
    observer.observe(video)
    return () => observer.disconnect()
  }, [shouldPlay])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster ?? undefined}
      aria-label={label}
      className={className}
      style={style}
      muted                // browsers only play videos on their own when they're silent
      loop
      playsInline          // without it an iPhone opens the video full screen
      preload="metadata"
    />
  )
}

// Visitors can ask their device to reduce motion (an accessibility setting)
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
