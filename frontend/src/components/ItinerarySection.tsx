import React, { useState, useEffect } from 'react';
import { ClockIcon } from "@heroicons/react/24/outline";
import { Trip } from '../types/Trip';
import { useLanguage } from '../context/LanguageContext';

export default function ItinerarySection() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const { translator } = useLanguage();

  useEffect(() => {
    // Simulate fetching the selected trip from the session
    setTimeout(() => {
      // Replace this with actual session fetching logic
      const trip: Trip | null = null; // Example: fetched trip or null if no trip is selected
      setSelectedTrip(trip);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <div className="w-1/3 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedTrip) {
    return (
      <div className="w-1/3 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <ClockIcon className="h-6 w-6 text-gray-600" />
          <p className="text-gray-600">{translator('itinerary-prompt')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{selectedTrip.name}</h2>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
        {selectedTrip.features.map((feature, index) => (
          <span key={index}>{feature}</span>
        ))}
      </div>
      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
        <h3 className="font-semibold mb-2">{translator('itinerary-title')}</h3>
        <div className="space-y-4">
          {selectedTrip.itinerary.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
