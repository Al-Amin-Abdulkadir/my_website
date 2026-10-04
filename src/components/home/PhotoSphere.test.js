import { describe, expect, test } from 'vitest'
import { IDENTITY, applyRotation, buildTiles, multiply, orthonormalize, rotationX, rotationY } from './PhotoSphere'

const photos = Array.from({ length: 8 }, (_, index) => ({ src: `/photo-${index}.jpg`, alt: '' }))
const length = ([x, y, z]) => Math.hypot(x, y, z)

describe('buildTiles', () => {
  test('every photo appears exactly once — no duplicates', () => {
    const tiles = buildTiles(photos)
    expect(tiles).toHaveLength(photos.length)
    expect(new Set(tiles.map((tile) => tile.photo.src)).size).toBe(photos.length)
  })

  test('photos sit between 0.7 and 1.0 of the way out, so the middle of the cloud breathes', () => {
    for (const tile of buildTiles(photos)) {
      expect(length(tile.position)).toBeGreaterThanOrEqual(0.7 - 1e-9)
      expect(length(tile.position)).toBeLessThanOrEqual(1 + 1e-9)
    }
  })

  test('the cloud has the same shape on every visit', () => {
    expect(buildTiles(photos)).toEqual(buildTiles(photos))
  })
})

describe('turning the cloud', () => {
  test('turning moves a photo without changing its distance from the centre', () => {
    const turned = multiply(rotationX(0.7), rotationY(-1.3))
    expect(length(applyRotation(turned, [0.3, -0.5, 0.8]))).toBeCloseTo(length([0.3, -0.5, 0.8]), 10)
  })

  test('a quarter turn to the right brings the right side to the front', () => {
    const [x, , z] = applyRotation(rotationY(-Math.PI / 2), [1, 0, 0])
    expect(x).toBeCloseTo(0, 10)
    expect(z).toBeCloseTo(1, 10)
  })

  test('re-straightening repairs a slightly bent matrix (thousands of tiny turns bend it)', () => {
    const bent = [[1.001, 0.002, 0], [0, 0.999, 0.001], [0, 0, 1]]
    const fixed = orthonormalize(bent)
    for (const row of fixed) expect(length(row)).toBeCloseTo(1, 10)
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    expect(dot(fixed[0], fixed[1])).toBeCloseTo(0, 10)
  })

  test('not turning leaves everything where it is', () => {
    expect(applyRotation(IDENTITY, [0.2, 0.4, 0.6])).toEqual([0.2, 0.4, 0.6])
  })
})
