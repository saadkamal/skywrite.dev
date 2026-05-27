/**
 * Author: Saad Kamal
 * Unit tests for the rule-based hand gesture classifier.
 */
import { describe, expect, it } from 'vitest'
import { classify, fingerExtended } from './gestures'

type Landmark = { x: number; y: number; z: number }

/** Builds a synthetic landmark list where selected fingers are extended. */
function makeHand(extended: number[]): Landmark[] {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }))
  landmarks[0] = { x: 0, y: 0, z: 0 }

  const pairs = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ]

  pairs.forEach(([tip, pip], index) => {
    const isExtended = extended.includes(index)
    landmarks[pip] = { x: isExtended ? 2 : 3, y: 0, z: 0 }
    landmarks[tip] = { x: isExtended ? 4 : 2, y: 0, z: 0 }
  })

  return landmarks
}

describe('gesture classification', () => {
  it('detects whether a finger is extended from wrist-relative distance', () => {
    const hand = makeHand([0])

    expect(fingerExtended(hand, 8, 6)).toBe(true)
    expect(fingerExtended(hand, 12, 10)).toBe(false)
  })

  it.each([
    ['idle', []],
    ['draw', [0]],
    ['move', [0, 1]],
    ['erase', [0, 1, 2]],
    ['erase', [0, 1, 2, 3]],
  ] as const)('classifies %s mode', (mode, extended) => {
    expect(classify(makeHand([...extended]))).toBe(mode)
  })
})
