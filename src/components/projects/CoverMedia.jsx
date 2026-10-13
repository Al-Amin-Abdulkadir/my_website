import { useEffect, useRef } from 'react'
import { compressCloudinaryVideo, isVideoUrl, resizeCloudinaryImage, videoStillOf } from '../../data/cloudinary'
import { coverStyle } from './coverFraming'

// A project's cover on the Projects list: a photo, or a video that plays silently
// on loop like a moving photo (an animated logo, say). Search and the admin show a
// still instead (stillOf in cloudinary.js), which is much lighter.
export default function CoverMedia({ entry, width, alt, isAboveTheFold = false }) {
  const style = coverStyle(entry)
  const still = videoStillOf(entry.coverUrl, width)

  if (!isVideoUrl(entry.coverUrl)) {
    return (
      <img
        src={resizeCloudinaryImage(entry.coverUrl, width)}
        alt={alt}
        loading={isAboveTheFold ? 'eager' : 'lazy'}
        style={style}
      />
    )
  }

  // Visitors who asked their device to reduce motion get the first frame, not a loop
  const shouldPlay = !prefersReducedMotion()
  if (!shouldPlay && still) {
    return <img src={still} alt={alt} loading={isAboveTheFold ? 'eager' : 'lazy'} style={style} />
  }

  return (
    <CoverVideo
      src={compressCloudinaryVideo(entry.coverUrl, width)}
      poster={still}
      label={alt}
      style={style}
      shouldPlay={shouldPlay}
    />
  )
}

// Plays only while on screen: a page of looping videos would otherwise keep every
// one of them running (and draining a phone's battery) after you scroll past.
// With shouldPlay off (reduced motion) it just shows its first frame.
function CoverVideo({ src, poster, label, style, shouldPlay }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!shouldPlay) return
    const video = videoRef.current
    const observer = new IntersectionObserver(([sighting]) => {
      if (sighting.isIntersecting) {
        // An iPhone in Low Power Mode refuses to autoplay. That's fine: the
        // poster (the first frame) stays, like a photo cover.
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
      style={style}
      muted                // browsers only play videos on their own when they're silent
      loop
      playsInline          // without it an iPhone opens the video full screen
      preload="metadata"
    />
  )
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
