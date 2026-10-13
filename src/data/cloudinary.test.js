import { expect, test } from 'vitest'
import { compressCloudinaryVideo, isVideoUrl, resizeCloudinaryImage, stillOf, videoStillOf } from './cloudinary'

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

const VIDEO = 'https://res.cloudinary.com/demo/video/upload/v1712/portfolio-cms/logo.mov'

test('knows a video from a photo', () => {
  expect(isVideoUrl(VIDEO)).toBe(true)
  expect(isVideoUrl('/clips/intro.MP4')).toBe(true)
  expect(isVideoUrl('https://res.cloudinary.com/demo/image/upload/v1712/portfolio-cms/abc.jpg')).toBe(false)
})

test('a video\'s still is its first frame as a JPEG, at the width needed', () => {
  expect(videoStillOf(VIDEO, 600)).toBe('https://res.cloudinary.com/demo/video/upload/so_0,q_auto,w_600/v1712/portfolio-cms/logo.jpg')
  expect(videoStillOf('/clips/intro.mp4', 600)).toBe(null)   // only Cloudinary can make one
})

test('a still of any upload: a photo resized, a video\'s first frame', () => {
  expect(stillOf('https://res.cloudinary.com/demo/image/upload/v1/abc.jpg', 240)).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_240/v1/abc.jpg')
  expect(stillOf(VIDEO, 240)).toBe(videoStillOf(VIDEO, 240))
})

test('videos from the editor are asked for in a smaller file', () => {
  expect(compressCloudinaryVideo(VIDEO, 2000)).toBe('https://res.cloudinary.com/demo/video/upload/q_auto,c_limit,w_2000/v1712/portfolio-cms/logo.mp4')
  expect(compressCloudinaryVideo('/clips/intro.mp4', 2000)).toBe('/clips/intro.mp4')
})
