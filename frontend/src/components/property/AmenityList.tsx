'use client';

import React, { useState } from 'react';
import {
  Wifi,
  ChefHat,
  Wind,
  WashingMachine,
  Tv,
  Car,
  Dumbbell,
  Waves,
  Flame,
  Coffee,
  Lock,
  Zap,
  Bath,
  Bed,
  DoorOpen,
  UtensilsCrossed,
  ShowerHead,
  Trees,
  PawPrint,
  Baby,
  Cigarette,
  Snowflake,
  Sun,
  MonitorSpeaker,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AmenityListProps {
  amenities: string[];
}

const COLLAPSED_COUNT = 6;

/** Maps backend amenity strings to Lucide icons (best match). */
function getAmenityIcon(amenity: string): LucideIcon {
  const lower = amenity.toLowerCase().replace(/_/g, ' ');

  if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
  if (lower.includes('kitchen') || lower.includes('cook')) return ChefHat;
  if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning')) return Wind;
  if (lower.includes('washer') || lower.includes('laundry') || lower.includes('washing')) return WashingMachine;
  if (lower.includes('tv') || lower.includes('television')) return Tv;
  if (lower.includes('parking') || lower.includes('car') || lower.includes('garage')) return Car;
  if (lower.includes('gym') || lower.includes('fitness')) return Dumbbell;
  if (lower.includes('pool') || lower.includes('swim')) return Waves;
  if (lower.includes('fireplace') || lower.includes('fire')) return Flame;
  if (lower.includes('coffee') || lower.includes('espresso')) return Coffee;
  if (lower.includes('safe') || lower.includes('lock') || lower.includes('locker')) return Lock;
  if (lower.includes('dryer') || lower.includes('electric')) return Zap;
  if (lower.includes('bath') || lower.includes('tub') || lower.includes('jacuzzi')) return Bath;
  if (lower.includes('bed') || lower.includes('bedroom')) return Bed;
  if (lower.includes('balcony') || lower.includes('terrace') || lower.includes('patio')) return DoorOpen;
  if (lower.includes('dining') || lower.includes('dishwasher')) return UtensilsCrossed;
  if (lower.includes('shower')) return ShowerHead;
  if (lower.includes('garden') || lower.includes('outdoor')) return Trees;
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return PawPrint;
  if (lower.includes('crib') || lower.includes('baby') || lower.includes('children')) return Baby;
  if (lower.includes('smoking') || lower.includes('smoke')) return Cigarette;
  if (lower.includes('heat') || lower.includes('heating') || lower.includes('warm')) return Snowflake;
  if (lower.includes('solar') || lower.includes('sunny') || lower.includes('skylight')) return Sun;
  if (lower.includes('speaker') || lower.includes('sound') || lower.includes('music')) return MonitorSpeaker;

  // Default
  return Zap;
}

/** Convert snake_case amenity string to human-readable label. */
function formatAmenity(amenity: string): string {
  return amenity
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * AmenityList Component (T045)
 *
 * Renders each amenity with a Lucide icon.
 * Shows first 6; toggles to show all via "Show all (N)" button.
 */
export function AmenityList({ amenities }: AmenityListProps) {
  const [expanded, setExpanded] = useState(false);

  if (!amenities || amenities.length === 0) {
    return (
      <p className="text-taupe text-sm" data-testid="amenity-list-empty">
        No amenities listed
      </p>
    );
  }

  const visible = expanded ? amenities : amenities.slice(0, COLLAPSED_COUNT);
  const hasMore = amenities.length > COLLAPSED_COUNT;

  return (
    <div data-testid="amenity-list">
      <ul className="grid grid-cols-2 gap-3">
        {visible.map((amenity) => {
          const Icon = getAmenityIcon(amenity);
          return (
            <li key={amenity} className="flex items-center gap-2 text-ink">
              <Icon className="w-5 h-5 text-taupe flex-shrink-0" aria-hidden />
              <span className="text-sm">{formatAmenity(amenity)}</span>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 text-sm font-medium text-terracotta hover:opacity-70 underline underline-offset-2 transition-opacity"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Show all (${amenities.length})`}
        </button>
      )}
    </div>
  );
}
