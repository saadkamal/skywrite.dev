/**
 * Author: Saad Kamal
 * Unit tests for the interactive gesture tutorial page.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import GestureTutorial from './GestureTutorial'

describe('GestureTutorial', () => {
  it('navigates between gesture steps', async () => {
    render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><GestureTutorial /></MemoryRouter>)

    expect(screen.getAllByText('Closed fist').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Next gesture →' }))
    expect(screen.getAllByText('Index finger extended').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: '← Previous' }))
    expect(screen.getAllByText('Closed fist').length).toBeGreaterThan(0)
  })

  it('marks a gesture as practiced after the countdown', async () => {
    vi.useFakeTimers()
    render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><GestureTutorial /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Practice this gesture' }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText(/Gesture practiced!/)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
