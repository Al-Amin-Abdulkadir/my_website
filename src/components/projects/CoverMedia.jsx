import LoopingVideo, { prefersReducedMotion } from '../ui/LoopingVideo'
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
    <LoopingVideo
      src={compressCloudinaryVideo(entry.coverUrl, width)}
      poster={still}
      label={alt}
      style={style}
      shouldPlay={shouldPlay}
    />
  )
}
