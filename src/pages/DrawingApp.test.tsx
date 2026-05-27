/**
 * Author: Saad Kamal
 * Unit tests for the drawing workspace's pointer fallback and camera controls.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DrawingApp from './DrawingApp'

let handsConstructor: ReturnType<typeof vi.fn>

/** Provides enough canvas API surface for DrawingApp's render and export paths. */
function mockCanvas() {
  const context = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    setTransform: vi.fn(),
  }

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => {
    callback(new Blob(['png'], { type: 'image/png' }))
  })
}

/** Provides the MediaPipe Hands surface used by the drawing app boot flow. */
function mockHands(overrides: Partial<{
  setOptions: ReturnType<typeof vi.fn>
  initialize: ReturnType<typeof vi.fn>
  onResults: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
}> = {}) {
  handsConstructor = vi.fn(function MockHands(this: Record<string, unknown>) {
    this.setOptions = overrides.setOptions ?? vi.fn()
    this.initialize = overrides.initialize ?? vi.fn().mockResolvedValue(undefined)
    this.onResults = overrides.onResults ?? vi.fn()
    this.send = overrides.send ?? vi.fn().mockResolvedValue(undefined)
    this.close = overrides.close ?? vi.fn().mockResolvedValue(undefined)
  })

  vi.stubGlobal('Hands', handsConstructor)
}

describe('DrawingApp', () => {
  beforeEach(() => {
    mockCanvas()
    mockHands()
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:skywrite')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the camera when the drawing app opens', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new DOMException('Blocked', 'NotAllowedError'))
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })

    render(<DrawingApp />)

    expect(await screen.findByText(/Camera permission was blocked/)).toBeInTheDocument()
    expect(getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    })
    expect(handsConstructor).not.toHaveBeenCalled()
  })

  it('captures pointer strokes and exports a PNG', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    })

    render(<DrawingApp />)

    const canvases = document.querySelectorAll('canvas')
    const uiCanvas = canvases[2]
    fireEvent.pointerDown(uiCanvas, { clientX: 10, clientY: 10 })
    fireEvent.pointerMove(uiCanvas, { clientX: 20, clientY: 20 })
    fireEvent.pointerUp(uiCanvas)

    await userEvent.click(screen.getByRole('button', { name: 'Save PNG' }))

    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled()
  })

  it('marks the camera unavailable when browser media APIs are absent', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    })

    render(<DrawingApp />)

    expect(screen.getByText('No Camera')).toBeInTheDocument()
    expect(screen.getByText(/does not expose camera access/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try Camera Again' })).toBeInTheDocument()
  })

  it('surfaces blocked browser permission after an explicit camera request', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('Blocked', 'NotAllowedError')) },
    })

    render(<DrawingApp />)

    expect(await screen.findByText(/Camera permission was blocked/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try Camera Again' })).toBeInTheDocument()
  })

  it('reports local hand-tracking runtime failures separately from camera permission', async () => {
    const stop = vi.fn()
    const getUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop }],
    })
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    mockHands({
      initialize: vi.fn().mockRejectedValue(new Error('MediaPipe failed')),
    })

    render(<DrawingApp />)

    await waitFor(() => expect(getUserMedia).toHaveBeenCalled())
    fireEvent.canPlay(document.querySelector('video') as HTMLVideoElement)

    expect(await screen.findByText(/local hand-tracking runtime could not start/)).toBeInTheDocument()
    expect(stop).toHaveBeenCalled()
  })
})
