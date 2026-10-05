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
