'use client';

import React, { useState } from 'react';
import { SearchFilters, PropertyType } from '@/types';

interface FilterPanelProps {
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
}

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'villa', 'cabin', 'studio'];
const BEDROOM_OPTIONS = [1, 2, 3, 4];
const AMENITIES = ['WiFi', 'Kitchen', 'Air Conditioning', 'Pool', 'Parking'];

export function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [amenities, setAmenities] = useState<string[]>([]);

  const handleMinPriceChange = (value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    // Validate that min price doesn't exceed max price
    if (num && maxPrice && num > maxPrice) {
      console.warn('Min price cannot be greater than max price');
      return;
    }
    setMinPrice(num);
    onFiltersChange({ min_price: num });
  };

  const handleMaxPriceChange = (value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    // Validate that max price isn't less than min price
    if (num && minPrice && num < minPrice) {
      console.warn('Max price cannot be less than min price');
      return;
    }
    setMaxPrice(num);
    onFiltersChange({ max_price: num });
  };

  const handlePropertyTypeChange = (type: PropertyType) => {
    if (propertyType === type) {
      setPropertyType(undefined);
      onFiltersChange({ property_type: undefined });
    } else {
      setPropertyType(type);
      onFiltersChange({ property_type: type });
    }
  };

  const handleBedroomsChange = (value: number) => {
    if (bedrooms === value) {
      setBedrooms(undefined);
      onFiltersChange({ bedrooms: undefined });
    } else {
      setBedrooms(value);
      onFiltersChange({ bedrooms: value });
    }
  };

  const handleAmenityChange = (amenity: string) => {
    let newAmenities: string[];
    if (amenities.includes(amenity)) {
      newAmenities = amenities.filter(a => a !== amenity);
    } else {
      newAmenities = [...amenities, amenity];
    }
    setAmenities(newAmenities);
    onFiltersChange({ amenities: newAmenities });
  };

  return (
    <div className="w-full bg-surface rounded-card border border-border p-6 space-y-6">
      {/* Price Range Section */}
      <div>
        <h3 className="text-lg font-serif text-ink mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-taupe mb-1">
              Minimum Price (EUR)
            </label>
            <input
              id="min-price"
              type="number"
              placeholder="Min"
              value={minPrice ?? ''}
              onChange={e => handleMinPriceChange(e.target.value)}
              className="w-full border border-border rounded-pill px-3 py-2 font-sans text-ink focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-taupe mb-1">
              Maximum Price (EUR)
            </label>
            <input
              id="max-price"
              type="number"
              placeholder="Max"
              value={maxPrice ?? ''}
              onChange={e => handleMaxPriceChange(e.target.value)}
              className="w-full border border-border rounded-pill px-3 py-2 font-sans text-ink focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
        </div>
      </div>

      {/* Property Type Section */}
      <div>
        <h3 className="text-lg font-serif text-ink mb-3">Property Type</h3>
        <div className="space-y-2">
          {PROPERTY_TYPES.map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={propertyType === type}
                onChange={() => handlePropertyTypeChange(type)}
                className="w-4 h-4 accent-terracotta border-border rounded"
              />
              <span className="text-sm text-taupe capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bedrooms Section */}
      <div>
        <h3 className="text-lg font-serif text-ink mb-3">Bedrooms</h3>
        <div className="grid grid-cols-4 gap-2">
          {BEDROOM_OPTIONS.map(value => (
            <button
              key={value}
              onClick={() => handleBedroomsChange(value)}
              className={`px-3 py-2 text-sm font-medium rounded-pill transition-colors ${
                bedrooms === value
                  ? 'bg-terracotta text-white'
                  : 'bg-canvas text-taupe hover:bg-terracotta-tint'
              }`}
            >
              {value}+
            </button>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <h3 className="text-lg font-serif text-ink mb-3">Amenities</h3>
        <div className="space-y-2">
          {AMENITIES.map(amenity => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="w-4 h-4 accent-terracotta border-border rounded"
              />
              <span className="text-sm text-ink">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
