import { expect, test } from 'vitest'
import { resizeCloudinaryImage } from './cloudinary'

test('asks Cloudinary for the width needed', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/assets/photo.png'
  expect(resizeCloudinaryImage(url, 600)).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/assets/photo.png')
})

test('leaves images that are not on Cloudinary alone', () => {
  expect(resizeCloudinaryImage('/uploads/abc.jpg', 600)).toBe('/uploads/abc.jpg')
})
