import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-4', 'h-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-12', 'h-12')
  })

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class'
    render(<LoadingSpinner className={customClass} />)
    
    const container = screen.getByRole('status').parentElement
    expect(container).toHaveClass(customClass)
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    const srText = screen.getByText('Loading...')
    
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    expect(srText).toHaveClass('sr-only')
  })
})
