/**
 * Author: Saad Kamal
 * Unit tests for camera calibration diagnostics.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CameraCalibration from './CameraCalibration'

describe('CameraCalibration', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
  })

  it('renders the diagnostic checklist before camera permission', () => {
    render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><CameraCalibration /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Camera Calibration' })).toBeInTheDocument()
    expect(screen.getByText('Browser supports WebRTC')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Camera Test/ })).toBeInTheDocument()
  })

  it('shows unavailable status when getUserMedia is missing', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    })

    render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><CameraCalibration /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /Start Camera Test/ }))

    expect(await screen.findByText('No camera detected')).toBeInTheDocument()
  })
})
