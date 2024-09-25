import React, { useState, useEffect } from 'react';
import { ClockIcon, CalendarIcon, UserGroupIcon, MapPinIcon, CurrencyDollarIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';

interface ItinerarySectionProps {
  tripProperties: { [key: string]: any };
  tripItinerary: string;
}

export default function ItinerarySection({ tripProperties, tripItinerary }: ItinerarySectionProps) {
  const [loading, setLoading] = useState(true);
  const { translator } = useLanguage();

  useEffect(() => {
    if (
      tripProperties &&
      Object.keys(tripProperties).length > 0
    ) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [tripProperties, tripItinerary]);

  const formatDate = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  if (loading) {
    return (
      <div className="w-full p-4 flex items-center justify-center">
        <div className="animate-ping-slow rounded-full h-20 w-20 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!tripProperties || Object.keys(tripProperties).length === 0) {
    return (
      <div className="w-full p-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <ClockIcon className="h-6 w-6 text-gray-600" />
          <p className="text-gray-600">{translator('itinerary-prompt')}</p>
        </div>
      </div>
    );
  }

  const badges: { [key: string]: JSX.Element | undefined } = {
    "destination": <MapPinIcon className="h-5 w-5 text-gray-600" />,
    "startDate": <CalendarIcon className="h-5 w-5 text-gray-600" />,
    "endDate": <CalendarIcon className="h-5 w-5 text-gray-600" />,
    "accompaniment": <UserGroupIcon className="h-5 w-5 text-gray-600" />,
    "activityType": <FaceSmileIcon className="h-5 w-5 text-gray-600" />,
    "budget": <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
  };

  return (
    <div className="w-1/2 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{`${tripProperties['destination']}`}</h2>
      </div>
      <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600 mb-4">
        {Object.entries(tripProperties).map(([key, value], index) => (
          (value && value !== '' && value.length > 0) &&
          <div key={index} className="flex items-center space-x-2 bg-gray-200 rounded-full py-1 px-3 mb-2">
            {badges[key] || null}
            <span>{key.includes('Date') ? formatDate(value) : Array.isArray(value) ? value.join(', ') : value}</span>
          </div>
        ))}
      </div>
      {tripItinerary ? (
        <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
          <h3 className="font-semibold mb-2">{translator('itinerary-title')}</h3>
          <div className="flex-1 space-y-4 overflow-y-auto">
            <ReactMarkdown>{tripItinerary}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="w-1/2 p-4 flex items-center justify-center">
          <div className="animate-pulse text-gray-600">{translator('itinerary-loading')}</div>
        </div>
      )}
    </div>
  );
}
