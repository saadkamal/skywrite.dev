/**
 * Author: Saad Kamal
 * Unit tests for canvas setup and drawing helpers.
 */
import { describe, expect, it, vi } from 'vitest'
import { drawHandSkeleton, drawStroke, setupCanvas } from './canvas'
import { HAND_CONNECTIONS } from './constants'

/** Creates a spy-backed canvas context for draw helper assertions. */
function makeContext() {
  return {
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    quadraticCurveTo: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    shadowBlur: 0,
    shadowColor: '',
  } as unknown as CanvasRenderingContext2D
}

describe('canvas helpers', () => {
  it('sets canvas backing size and DPR transform', () => {
    const canvas = document.createElement('canvas')
    const context = makeContext()
    vi.spyOn(canvas, 'getContext').mockReturnValue(context)
    vi.stubGlobal('devicePixelRatio', 2)

    expect(setupCanvas(canvas, 320, 180)).toBe(context)
    expect(canvas.width).toBe(640)
    expect(canvas.height).toBe(360)
    expect(canvas.style.width).toBe('320px')
    expect(canvas.style.height).toBe('180px')
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0)
  })

  it('draws dots, lines, and curved strokes', () => {
    const context = makeContext()

    drawStroke(context, { color: '#00f0ff', thickness: 8, glow: 50, points: [{ x: 1, y: 2 }] })
    expect(context.arc).toHaveBeenCalledWith(1, 2, 4, 0, Math.PI * 2)
    expect(context.fill).toHaveBeenCalled()

    drawStroke(context, { color: '#fff', thickness: 4, glow: 0, points: [{ x: 0, y: 0 }, { x: 8, y: 8 }] })
    expect(context.lineTo).toHaveBeenCalledWith(8, 8)

    drawStroke(context, {
      color: '#fff',
      thickness: 4,
      glow: 0,
      points: [{ x: 0, y: 0 }, { x: 5, y: 10 }, { x: 10, y: 0 }],
    })
    expect(context.quadraticCurveTo).toHaveBeenCalled()
  })

  it('draws all configured hand skeleton connections', () => {
    const context = makeContext()
    const landmarks = Array.from({ length: 21 }, (_, index) => ({ x: index, y: index + 1 }))

    drawHandSkeleton(context, landmarks, '#fff')

    expect(context.lineTo).toHaveBeenCalledTimes(HAND_CONNECTIONS.length)
    expect(context.arc).toHaveBeenCalledTimes(21)
  })
})
