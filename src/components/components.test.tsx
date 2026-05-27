/**
 * Author: Saad Kamal
 * Component smoke tests for public landing-page sections.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type React from 'react'
import '../i18n'
import { CTASection } from './CTASection'
import { FAQSection } from './FAQSection'
import { FeaturesSection } from './FeaturesSection'
import { Footer } from './Footer'
import { GesturesSection } from './GesturesSection'
import { Header } from './Header'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'

/** Renders router-aware components with the minimal app providers. */
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>{ui}</MemoryRouter>)
}

describe('landing page components', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the header and toggles the mobile menu', async () => {
    renderWithRouter(<Header />)

    expect(screen.getByText('skywrite')).toBeInTheDocument()
    const menuButton = screen.getByRole('button', { name: 'Toggle menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByText('features').length).toBeGreaterThan(1)

    await userEvent.click(screen.getAllByText('features')[1])
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('compacts the header after page scroll', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 32 })

    renderWithRouter(<Header />)
    fireEvent.scroll(window)

    expect(document.querySelector('.header')).toHaveClass('header--scrolled')
  })

  it('renders hero links and local-processing copy', () => {
    renderWithRouter(<HeroSection />)

    expect(screen.getByRole('heading', { name: 'Real-time hand tracking' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Launch app →' })).toHaveAttribute('href', '/draw')
    expect(screen.getByText('frame uploads')).toBeInTheDocument()
  })

  it('renders feature, architecture, gesture, cta, and footer sections', () => {
    renderWithRouter(
      <>
        <FeaturesSection />
        <HowItWorksSection />
        <GesturesSection />
        <CTASection />
        <Footer />
      </>,
    )

    expect(screen.getByRole('heading', { name: 'What Skywrite can do' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Four gesture states' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ready to draw with your hands?' })).toBeInTheDocument()
    expect(screen.getByText('© 2026 Saad Kamal. Skywrite is built with MediaPipe, Canvas API, and React.')).toBeInTheDocument()
  })

  it('toggles FAQ answers', async () => {
    renderWithRouter(<FAQSection />)

    const question = screen.getByRole('button', { name: /Which browsers are supported?/ })
    expect(question).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'false')
  })
})
