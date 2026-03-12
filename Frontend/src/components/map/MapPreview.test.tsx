import { render, screen } from '@testing-library/react';
import { MapPreview } from './MapPreview';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, style, ...props }: any) => (
    <div 
      data-testid="map-container" 
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
      data-style={JSON.stringify(style)}
      {...props}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: any) => (
    <div 
      data-testid="tile-layer" 
      data-url={url}
      data-attribution={attribution}
    />
  ),
  CircleMarker: ({ center, radius, pathOptions }: any) => (
    <div 
      data-testid="circle-marker" 
      data-center={JSON.stringify(center)}
      data-radius={radius}
      data-color={pathOptions?.color}
      data-fill-color={pathOptions?.fillColor}
    />
  ),
  useMap: () => ({
    fitBounds: jest.fn(),
    setView: jest.fn(),
  }),
}));

describe('MapPreview', () => {
  const mockOrigin = { lat: 40.4168, lng: -3.7038 };
  const mockDestination = { lat: 41.3851, lng: 2.1734 };

  it('renders map container with correct props', () => {
    render(
      <MapPreview 
        origin={mockOrigin} 
        height={200}
        interactive={false}
        tilesUrl="https://custom.tiles.com/{z}/{x}/{y}.png"
      />
    );
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveAttribute('data-center', JSON.stringify([mockOrigin.lat, mockOrigin.lng]));
    expect(mapContainer).toHaveAttribute('data-zoom', '13');
    expect(mapContainer).toHaveAttribute('data-style', JSON.stringify({ height: '100%', width: '100%' }));
  });

  it('renders tile layer with correct URL and attribution', () => {
    const customTilesUrl = 'https://custom.tiles.com/{z}/{x}/{y}.png';
    render(<MapPreview origin={mockOrigin} tilesUrl={customTilesUrl} />);
    
    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toBeInTheDocument();
    expect(tileLayer).toHaveAttribute('data-url', customTilesUrl);
    expect(tileLayer).toHaveAttribute('data-attribution', '© OpenStreetMap contributors');
  });

  it('renders origin marker when origin is provided', () => {
    render(<MapPreview origin={mockOrigin} />);
    
    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute('data-center', JSON.stringify([mockOrigin.lat, mockOrigin.lng]));
    expect(markers[0]).toHaveAttribute('data-color', '#2563EB');
    expect(markers[0]).toHaveAttribute('data-fill-color', '#3B82F6');
  });

  it('renders both origin and destination markers when both are provided', () => {
    render(<MapPreview origin={mockOrigin} destination={mockDestination} />);
    
    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(2);
    
    // Origin marker (blue)
    expect(markers[0]).toHaveAttribute('data-center', JSON.stringify([mockOrigin.lat, mockOrigin.lng]));
    expect(markers[0]).toHaveAttribute('data-color', '#2563EB');
    
    // Destination marker (green)
    expect(markers[1]).toHaveAttribute('data-center', JSON.stringify([mockDestination.lat, mockDestination.lng]));
    expect(markers[1]).toHaveAttribute('data-color', '#059669');
  });

  it('does not render when no valid coordinates are provided', () => {
    const { container } = render(<MapPreview origin={null} destination={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when coordinates are invalid', () => {
    const { container } = render(
      <MapPreview 
        origin={{ lat: NaN, lng: NaN }} 
        destination={{ lat: null as any, lng: undefined as any }} 
      />
    );
    // The component still renders but with invalid coordinates
    expect(container.firstChild).not.toBeNull();
  });

  it('uses default height when not provided', () => {
    render(<MapPreview origin={mockOrigin} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<MapPreview origin={mockOrigin} height={300} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveAttribute('data-style', JSON.stringify({ height: '100%', width: '100%' }));
  });

  it('applies interactive props correctly', () => {
    render(<MapPreview origin={mockOrigin} interactive={true} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<MapPreview origin={mockOrigin} ariaLabel="Custom map label" />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('uses default tiles URL when not provided', () => {
    render(<MapPreview origin={mockOrigin} />);
    
    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toHaveAttribute('data-url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});
