/**
 * Author: Saad Kamal
 * Route-level smoke tests for the Skywrite single-page app.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import './i18n'
import App from './App'

describe('App routes', () => {
  it('renders the landing page at the default route', () => {
    window.history.pushState({}, '', '/')
    render(<App />)

    expect(screen.getByText('Real-time hand tracking')).toBeInTheDocument()
    expect(document.documentElement.lang).toBeTruthy()
  })

  it('renders the tutorial route', () => {
    window.history.pushState({}, '', '/tutorial')
    render(<App />)

    expect(screen.getByText('Gesture Tutorial')).toBeInTheDocument()
  })
})
