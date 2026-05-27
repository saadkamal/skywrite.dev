/**
 * Author: Saad Kamal
 * Shared Vitest setup for DOM assertions used by component and unit tests.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
