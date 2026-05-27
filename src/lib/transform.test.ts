/**
 * Author: Saad Kamal
 * Unit tests for coordinate mapping and scalar math helpers.
 */
import { describe, expect, it } from 'vitest'
import { clamp, coverTransform, dist, lerp, mapLandmark } from './transform'

describe('transform helpers', () => {
  it('cover-fits video into a wider canvas', () => {
    expect(coverTransform(640, 480, 1280, 720)).toEqual({
      dw: 1280,
      dh: 960,
      ox: 0,
      oy: -120,
    })
  })

  it('maps normalized mirrored landmarks into canvas coordinates', () => {
    const transform = coverTransform(100, 100, 200, 100)

    expect(mapLandmark({ x: 0.25, y: 0.5, z: -0.1 }, transform)).toEqual({
      x: 150,
      y: 50,
      z: -0.1,
    })
  })

  it('computes distance, interpolation, and clamping', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(lerp(10, 20, 0.25)).toBe(12.5)
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-2, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
  })
})
