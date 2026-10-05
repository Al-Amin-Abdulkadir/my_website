import { expect, test } from 'vitest'
import { resizeCloudinaryImage } from './cloudinary'

test('asks Cloudinary for the width needed', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/assets/photo.png'
  expect(resizeCloudinaryImage(url, 600)).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/assets/photo.png')
})

test('leaves images that are not on Cloudinary alone', () => {
  expect(resizeCloudinaryImage('/uploads/abc.jpg', 600)).toBe('/uploads/abc.jpg')
})

test('adds sizing to images uploaded from the editor', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v1712/portfolio-cms/abc.jpg'
  expect(resizeCloudinaryImage(url, 600)).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1712/portfolio-cms/abc.jpg')
})

test('leaves videos alone', () => {
  const url = 'https://res.cloudinary.com/demo/video/upload/v1712/portfolio-cms/clip.mp4'
  expect(resizeCloudinaryImage(url, 600)).toBe(url)
})
