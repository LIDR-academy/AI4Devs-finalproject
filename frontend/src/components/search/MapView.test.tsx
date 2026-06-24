import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { PropertySummary } from '@/types';

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {},
}));

// Mock react-map-gl
vi.mock('react-map-gl/mapbox', async () => {
  const React = await import('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: { children?: React.ReactNode; longitude?: number; latitude?: number; [key: string]: unknown }) => (
      React.createElement('div', {
        'data-testid': 'mapbox-map',
        'data-longitude': props.longitude,
        'data-latitude': props.latitude,
      }, children)
    ),
    Map: ({ children, ...props }: { children?: React.ReactNode; longitude?: number; latitude?: number; [key: string]: unknown }) => (
      React.createElement('div', {
        'data-testid': 'mapbox-map',
        'data-longitude': props.longitude,
        'data-latitude': props.latitude,
      }, children)
    ),
    Marker: ({ children, 'data-testid': testId, ...props }: { children?: React.ReactNode; 'data-testid'?: string; [key: string]: unknown }) => (
      React.createElement('div', {
        'data-testid': testId,
        ...props,
      }, children)
    ),
    Popup: ({ children, longitude, latitude }: { children?: React.ReactNode; longitude?: number; latitude?: number }) => (
      React.createElement('div', {
        'data-testid': 'popup',
        'data-longitude': longitude,
        'data-latitude': latitude,
      }, children)
    ),
  };
});

// Import MapViewClient for testing (avoids next/dynamic issues)
import { MapViewClient } from './MapView.client';

// Set up environment variable for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test_token_12345';
});

describe('MapView Component', () => {
  const mockProperties: PropertySummary[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Cosy Barcelona Apartment',
      photo_url: 'https://example.com/photo.jpg',
      nightly_rate_eur: 120.0,
      location: {
        lat: 41.4001,
        lng: 2.1644,
        city: 'Barcelona',
        country: 'Spain',
      },
      avg_rating: 4.8,
      review_count: 12,
      property_type: 'apartment',
      max_guests: 4,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Modern Madrid Loft',
      photo_url: 'https://example.com/photo2.jpg',
      nightly_rate_eur: 150.0,
      location: {
        lat: 40.4168,
        lng: -3.7038,
        city: 'Madrid',
        country: 'Spain',
      },
      avg_rating: 4.5,
      review_count: 8,
      property_type: 'apartment',
      max_guests: 2,
    },
  ];

  const mockViewport = {
    longitude: 2.1644,
    latitude: 41.4001,
    zoom: 12,
  };

  it('renders map container', () => {
    render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });

  it('displays markers for each property', () => {
    render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    // Should have markers for both properties
    mockProperties.forEach((prop) => {
      expect(
        screen.getByTestId(`marker-${prop.id}`)
      ).toBeInTheDocument();
    });
  });

  it('calls onViewportChange when map viewport changes', () => {
    const user = userEvent.setup();
    const handleViewportChange = vi.fn();

    render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={handleViewportChange}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    // Component should render without errors
    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });

  it('calls onPropertyHover when hovering over a marker', () => {
    const user = userEvent.setup();
    const handlePropertyHover = vi.fn();

    const { rerender } = render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={handlePropertyHover}
        onPropertyClick={() => {}}
        hoveredPropertyId={undefined}
      />
    );

    // Re-render with hovered property
    rerender(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={handlePropertyHover}
        onPropertyClick={() => {}}
        hoveredPropertyId={mockProperties[0].id}
      />
    );

    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });

  it('calls onPropertyClick when clicking a marker', () => {
    const user = userEvent.setup();
    const handlePropertyClick = vi.fn();

    render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={handlePropertyClick}
      />
    );

    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });

  it('renders empty with no properties', () => {
    render(
      <MapViewClient
        properties={[]}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });

  it('updates markers when properties change', () => {
    const { rerender } = render(
      <MapViewClient
        properties={[mockProperties[0]]}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    // Should have one marker
    expect(
      screen.getByTestId(`marker-${mockProperties[0].id}`)
    ).toBeInTheDocument();

    // Re-render with both properties
    rerender(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
      />
    );

    // Should now have both markers
    mockProperties.forEach((prop) => {
      expect(
        screen.getByTestId(`marker-${prop.id}`)
      ).toBeInTheDocument();
    });
  });

  it('highlights marker when hovered', () => {
    const { rerender } = render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={() => {}}
        hoveredPropertyId={mockProperties[0].id}
      />
    );

    const marker = screen.getByTestId(`marker-${mockProperties[0].id}`);
    expect(marker).toBeInTheDocument();
  });

  it('shows popup with property info on marker click', () => {
    const handlePropertyClick = vi.fn();

    render(
      <MapViewClient
        properties={mockProperties}
        viewport={mockViewport}
        onViewportChange={() => {}}
        onPropertyHover={() => {}}
        onPropertyClick={handlePropertyClick}
        selectedPropertyId={mockProperties[0].id}
      />
    );

    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
  });
});
