// Images on Cloudinary are stored at full size. Asking Cloudinary for a width (plus
// the best format and quality for the browser) avoids downloading 5000px images
// for a 1400px slot. Images that aren't on Cloudinary pass through unchanged.
export function resizeCloudinaryImage(url, width) {
  if (!url.includes('res.cloudinary.com')) return url

  // Older images already ask for f_auto,q_auto — add the width to that
  if (url.includes('/upload/f_auto,q_auto/')) {
    return url.replace('/upload/f_auto,q_auto/', `/upload/f_auto,q_auto,w_${width}/`)
  }
  // Images uploaded from the editor have no settings yet — add them all
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`)
  }
  return url   // e.g. videos
}

// Uploads can be videos too (a moving logo as a project's cover, a Home photo)
export function isVideoUrl(url) {
  return url.includes('/video/upload/') || /\.(mp4|webm|mov)$/i.test(url)
}

// Cloudinary can turn any video into a picture of its first frame (so_0 = "start
// offset 0 seconds", .jpg = as a JPEG). Used while a video loads, and wherever a
// still is enough (search, the admin). Videos elsewhere have no such picture: null.
export function videoStillOf(url, width) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return null
  return url
    .replace('/video/upload/', `/video/upload/so_0,q_auto,w_${width}/`)
    .replace(/\.(mp4|webm|mov)$/i, '.jpg')
}

// A picture of any upload at the width needed: a photo resized, or a video's first frame
export function stillOf(url, width) {
  return isVideoUrl(url) ? videoStillOf(url, width) : resizeCloudinaryImage(url, width)
}

// Videos uploaded from the editor are kept at full size and quality. Asking for the
// width needed (c_limit: shrink only, never enlarge) plus q_auto gets a much smaller
// file that looks the same, and .mp4 converts a .mov (which not every browser plays)
// to the format every browser does
export function compressCloudinaryVideo(url, width) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url
  return url
    .replace('/video/upload/', `/video/upload/q_auto,c_limit,w_${width}/`)
    .replace(/\.(webm|mov)$/i, '.mp4')
}
