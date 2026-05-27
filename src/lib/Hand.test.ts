/**
 * Author: Saad Kamal
 * Unit tests for the mutable per-hand state model.
 */
import { describe, expect, it } from 'vitest'
import { CURSOR_LERP, STABILIZER_DRAW_EXIT_FRAMES, STABILIZER_SWITCH_FRAMES } from './constants'
import { Hand } from './Hand'

describe('Hand', () => {
  it('smooths cursor movement after the first point', () => {
    const hand = new Hand('Right')

    hand.updateCursor({ x: 10, y: 20 })
    expect(hand.cursor).toEqual({ x: 10, y: 20 })

    hand.updateCursor({ x: 20, y: 40 })
    expect(hand.cursor.x).toBe(10 + (20 - 10) * CURSOR_LERP)
    expect(hand.cursor.y).toBe(20 + (40 - 20) * CURSOR_LERP)
  })

  it('requires consecutive frames before switching modes', () => {
    const hand = new Hand('Left')

    for (let i = 0; i < STABILIZER_SWITCH_FRAMES - 1; i++) {
      expect(hand.stabilize('draw')).toBe('idle')
    }
    expect(hand.stabilize('draw')).toBe('draw')

    for (let i = 0; i < STABILIZER_DRAW_EXIT_FRAMES - 1; i++) {
      expect(hand.stabilize('idle')).toBe('draw')
    }
    expect(hand.stabilize('idle')).toBe('idle')
  })

  it('resets transient state without changing author-owned constants', () => {
    const hand = new Hand('Right')
    hand.visible = true
    hand.cursorInit = true
    hand.armCount = 3
    hand.current = { color: '#fff', thickness: 4, glow: 0, points: [{ x: 1, y: 2 }] }
    hand.moveAnchor = { x: 1, y: 1 }
    hand.lastPalm = { x: 2, y: 2 }
    hand.wipeSpeed = 10
    hand.wiping = true

    hand.reset()

    expect(hand.visible).toBe(false)
    expect(hand.cursorInit).toBe(false)
    expect(hand.armCount).toBe(0)
    expect(hand.current).toBeNull()
    expect(hand.moveAnchor).toBeNull()
    expect(hand.lastPalm).toBeNull()
    expect(hand.wipeSpeed).toBe(0)
    expect(hand.wiping).toBe(false)
    expect(hand.armFrames).toBeGreaterThan(0)
  })
})
