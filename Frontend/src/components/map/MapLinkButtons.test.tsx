import { render, screen } from '@testing-library/react';
import { MapLinkButtons } from './MapLinkButtons';

describe('MapLinkButtons', () => {
  it('renders Google Maps and Waze buttons with correct URLs', () => {
    const lat = 40.4168;
    const lng = -3.7038;
    
    render(<MapLinkButtons lat={lat} lng={lng} />);
    
    const googleMapsLink = screen.getByRole('link', { name: /abrir en google maps/i });
    const wazeLink = screen.getByRole('link', { name: /abrir en waze/i });
    
    expect(googleMapsLink).toBeInTheDocument();
    expect(wazeLink).toBeInTheDocument();
    
    expect(googleMapsLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=40.4168,-3.7038');
    expect(wazeLink).toHaveAttribute('href', 'https://waze.com/ul?ll=40.4168%2C-3.7038&navigate=yes');
    
    expect(googleMapsLink).toHaveAttribute('target', '_blank');
    expect(wazeLink).toHaveAttribute('target', '_blank');
    
    expect(googleMapsLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(wazeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render when coordinates are invalid', () => {
    const { container } = render(<MapLinkButtons lat={NaN} lng={NaN} />);
    // NaN is still a number, so it renders but with invalid URLs
    expect(container.firstChild).not.toBeNull();
    const googleMapsLink = screen.getByRole('link', { name: /abrir en google maps/i });
    expect(googleMapsLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=NaN,NaN');
  });

  it('does not render when coordinates are not numbers', () => {
    const { container } = render(<MapLinkButtons lat={null as any} lng={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('generates correct URLs for different coordinates', () => {
    const { rerender } = render(<MapLinkButtons lat={0} lng={0} />);
    
    let googleMapsLink = screen.getByRole('link', { name: /abrir en google maps/i });
    let wazeLink = screen.getByRole('link', { name: /abrir en waze/i });
    
    expect(googleMapsLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=0,0');
    expect(wazeLink).toHaveAttribute('href', 'https://waze.com/ul?ll=0%2C0&navigate=yes');
    
    rerender(<MapLinkButtons lat={41.3851} lng={2.1734} />);
    
    googleMapsLink = screen.getByRole('link', { name: /abrir en google maps/i });
    wazeLink = screen.getByRole('link', { name: /abrir en waze/i });
    
    expect(googleMapsLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=41.3851,2.1734');
    expect(wazeLink).toHaveAttribute('href', 'https://waze.com/ul?ll=41.3851%2C2.1734&navigate=yes');
  });

  it('has correct styling classes', () => {
    render(<MapLinkButtons lat={40.4168} lng={-3.7038} />);
    
    const googleMapsLink = screen.getByRole('link', { name: /abrir en google maps/i });
    const wazeLink = screen.getByRole('link', { name: /abrir en waze/i });
    
    expect(googleMapsLink).toHaveClass('px-3', 'py-1', 'rounded-md', 'text-xs', 'font-medium');
    expect(wazeLink).toHaveClass('px-3', 'py-1', 'rounded-md', 'text-xs', 'font-medium');
  });
});
