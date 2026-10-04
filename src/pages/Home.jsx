import { useMemo } from 'react'
import PhotoSphere from '../components/home/PhotoSphere'
import { useCmsContent } from '../data/useCmsContent'
import './Home.css'

// Home: one full-screen cloud of photos (and videos) the visitor can spin and open.
// While the intro plays, the cloud waits collapsed at its centre, then grows out.
// The photos, captions and links come from the CMS (Admin → Home photos).
export default function Home({ isWaitingForIntro = false }) {
  const { data, error } = useCmsContent('/api/home-photos')
  // Build the cloud's photo list once per fetched result — a new list on every render
  // would make the cloud think its photos changed and restart
  const photos = useMemo(() => data?.map(toCloudPhoto), [data])

  return (
    <main className="home">
      {photos && <PhotoSphere photos={photos} isWaitingForIntro={isWaitingForIntro} />}
      {error && <p className="home-error">{error.message}</p>}
    </main>
  )
}

// The CMS's field names → the shape the cloud uses
export function toCloudPhoto(photo) {
  return {
    src: photo.imageUrl,
    alt: photo.alt,
    caption: photo.caption,
    link: photo.linkUrl ? { label: photo.linkLabel || 'View', url: photo.linkUrl } : null,
  }
}
