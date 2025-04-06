import { render, screen, fireEvent } from '@testing-library/react'
import SearchCategories from '../SearchCategories'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('SearchCategories Component', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('renders all categories with correct labels', () => {
    render(<SearchCategories />)

    // Check if all category labels are rendered
    expect(screen.getByText('Reporta Peludo Perdido o Encontrado')).toBeInTheDocument()
    expect(screen.getByText('Mis Reportes')).toBeInTheDocument()
    expect(screen.getByText('Explorar Reportes')).toBeInTheDocument()
    expect(screen.getByText('Adopta')).toBeInTheDocument()
    expect(screen.getByText('Sé Voluntario')).toBeInTheDocument()
    expect(screen.getByText('Chat de Ayuda')).toBeInTheDocument()
    expect(screen.getByText('Dona')).toBeInTheDocument()
  })

  it('navigates to /reportar when clicking Reporta Peludo Perdido', () => {
    render(<SearchCategories />)
    
    const reportButton = screen.getByText('Reporta Peludo Perdido o Encontrado')
    fireEvent.click(reportButton)

    expect(mockPush).toHaveBeenCalledWith('/reportar')
  })

  it('navigates to /mis-reportes when clicking Mis Reportes', () => {
    render(<SearchCategories />)
    
    const reportsButton = screen.getByText('Mis Reportes')
    fireEvent.click(reportsButton)

    expect(mockPush).toHaveBeenCalledWith('/mis-reportes')
  })

  it('renders the section title correctly', () => {
    render(<SearchCategories />)
    
    expect(screen.getByText('¿Cómo podemos ayudarte?')).toBeInTheDocument()
  })

  it('renders all category icons', () => {
    render(<SearchCategories />)
    
    // Check if all icons are rendered
    expect(screen.getByText('🔍')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('🔎')).toBeInTheDocument()
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('🤝')).toBeInTheDocument()
    expect(screen.getByText('💬')).toBeInTheDocument()
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })
}) 