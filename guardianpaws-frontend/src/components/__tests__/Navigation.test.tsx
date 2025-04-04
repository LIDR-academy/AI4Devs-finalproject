import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navigation from '../Navigation'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock next/navigation
let mockPathname = '/'
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname
}))

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset mockPathname to default value
    mockPathname = '/'
  })

  it('renders the logo and title', () => {
    render(<Navigation />)

    const logo = screen.getByText('GuardianPaws')
    expect(logo).toBeTruthy()
  })

  it('shows back button on non-home pages', () => {
    // Override mockPathname for this test
    mockPathname = '/reportar'
    render(<Navigation />)

    // Buscar el botón de retroceso por su clase
    const backButton = screen.getByRole('link', { name: '' })
    expect(backButton).toBeTruthy()
    expect(backButton.getAttribute('href')).toBe('/')
    expect(backButton.className).toContain('md:hidden')
  })

  it('toggles menu when clicking the menu button', () => {
    render(<Navigation />)

    // Menu should be hidden initially
    expect(screen.queryByText('Reportar Animal Perdido')).toBeNull()

    // Click menu button
    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // Menu should be visible
    expect(screen.getByText('Reportar Animal Perdido')).toBeTruthy()
    expect(screen.getByText('Mis Reportes')).toBeTruthy()
    expect(screen.getByText('Explorar Reportes')).toBeTruthy()

    // Click menu button again
    fireEvent.click(menuButton)

    // Menu should be hidden
    expect(screen.queryByText('Reportar Animal Perdido')).toBeNull()
  })

  it('renders menu links with correct hrefs', () => {
    render(<Navigation />)

    // Open menu
    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // Check hrefs
    expect(screen.getByText('Reportar Animal Perdido').closest('a')?.getAttribute('href')).toBe('/reportar')
    expect(screen.getByText('Mis Reportes').closest('a')?.getAttribute('href')).toBe('/mis-reportes')
    expect(screen.getByText('Explorar Reportes').closest('a')?.getAttribute('href')).toBe('/explorar')
  })
}) 