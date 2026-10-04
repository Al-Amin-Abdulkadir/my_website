// Old projects' images live on Cloudinary at full size. Asking Cloudinary for a
// width avoids downloading 5000px images for a 1400px slot. Local images pass through.
export function resizeCloudinaryImage(url, width) {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/f_auto,q_auto', `/upload/f_auto,q_auto,w_${width}`)
}
