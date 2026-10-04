// NOTE: the site no longer reads this file — content comes from the CMS (/admin).
// It's kept as the source for cms-api/scripts/export_site_content.mjs (the one-time
// import into the database) and for the resizeCloudinaryImage helper.
// Photos in the Home page cloud (the window, books and laptop photos are
// straightened copies of the tilted intro frames).
// Clicking one brings it forward with its caption.
//
// Each photo appears once. Optional extras shown when a photo is brought forward:
//   caption: 'A sentence about this photo'
//   link:    { label: 'See the project', url: '/project/nomad' }
//
// TODO (Alamin): write a caption for each photo, and send more photos —
// the cloud looks fuller with ~15–20. (The CMS will manage this list later.)
export const homePhotos = [
  { src: '/images/intro/sunset.webp',    alt: 'Sunlight through a window plant', caption: null, link: null },
  { src: '/images/home/window.webp',     alt: 'Reading by the window',           caption: null, link: null },
  { src: '/images/home/books.webp',      alt: 'Dostoevsky novels',               caption: null, link: null },
  { src: '/images/intro/desk.webp',      alt: 'Desk setup at night',             caption: null, link: null },
  { src: '/images/intro/childhood.webp', alt: 'Childhood photo',                 caption: null, link: null },
  { src: '/images/home/laptop.webp',     alt: 'Laptop and tablet notes',         caption: null, link: null },
  { src: '/images/home/sketch.webp',     alt: 'Sketchbook drawings',             caption: null, link: null },
  { src: '/images/home/book-page.webp',  alt: 'An open book page',               caption: null, link: null },
]
