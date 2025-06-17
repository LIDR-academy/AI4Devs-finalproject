"use client";

import { Globe } from '@/components/magicui/globe';

export function GlobeWrapper() {
  return (
    <Globe 
      className="w-full h-64 rounded" 
      config={{
        width: 800,
        height: 800,
        devicePixelRatio: 2,
        phi: 0,
        theta: 0.3,
        dark: 0,
        diffuse: 0.4,
        mapSamples: 16000,
        mapBrightness: 1.2,
        baseColor: [0.3, 0.3, 1],
        markerColor: [1, 0.5, 0],
        glowColor: [0.1, 0.1, 1],
        markers: [
          { location: [40.7128, -74.006], size: 0.1 },
          { location: [34.0522, -118.2437], size: 0.1 },
          { location: [51.5074, -0.1278], size: 0.1 },
          { location: [48.8566, 2.3522], size: 0.1 },
          { location: [35.6762, 139.6503], size: 0.1 },
        ],
        onRender: () => {}
      }}
    />
  );
}
