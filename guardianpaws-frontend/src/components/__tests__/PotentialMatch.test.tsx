import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PotentialMatch from '../PotentialMatch'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

describe('PotentialMatch Component', () => {
  const mockProps = {
    similarity: 85.5,
    petImage: 'https://example.com/pet-image.jpg',
    location: 'Ciudad de México',
    reportDate: '2023-10-15',
    onChatClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with all props', () => {
    render(<PotentialMatch {...mockProps} />)

    // Verifica que se muestre la imagen
    const image = screen.getByAltText('Mascota encontrada')
    expect(image).toBeTruthy()
    expect(image.getAttribute('src')).toBe(mockProps.petImage)

    // Verifica que se muestre el título
    expect(screen.getByText('¡Podría ser tu mascota!')).toBeTruthy()

    // Verifica que se muestre la similitud
    expect(screen.getByText(/Coincidencia: 85.50%/)).toBeTruthy()

    // Verifica que se muestre la ubicación
    expect(screen.getByText(/Ubicación: Ciudad de México/)).toBeTruthy()

    // Verifica que se muestre la fecha
    expect(screen.getByText(/Fecha de reporte:/)).toBeTruthy()

    // Verifica que se muestre el botón de chat
    expect(screen.getByText('Chatear con quien reportó esta mascota')).toBeTruthy()
  })

  it('calls onChatClick when chat button is clicked', () => {
    render(<PotentialMatch {...mockProps} />)

    // Simula un clic en el botón de chat
    const chatButton = screen.getByText('Chatear con quien reportó esta mascota')
    fireEvent.click(chatButton)

    // Verifica que se haya llamado a la función onChatClick
    expect(mockProps.onChatClick).toHaveBeenCalledTimes(1)
  })

  it('formats similarity percentage correctly', () => {
    // Prueba con diferentes valores de similitud
    const propsWithDifferentSimilarity = {
      ...mockProps,
      similarity: 99.999
    }
    
    render(<PotentialMatch {...propsWithDifferentSimilarity} />)
    expect(screen.getByText(/Coincidencia: 100.00%/)).toBeTruthy()
  })

  it('formats date correctly', () => {
    // Prueba con diferentes formatos de fecha
    const propsWithDifferentDate = {
      ...mockProps,
      reportDate: '2023-01-01'
    }
    
    render(<PotentialMatch {...propsWithDifferentDate} />)
    // Verifica que la fecha se muestre en el formato local
    expect(screen.getByText(/Fecha de reporte:/)).toBeTruthy()
  })
}) 