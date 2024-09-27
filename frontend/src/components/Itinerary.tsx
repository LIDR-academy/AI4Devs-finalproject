import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import {
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  FaceSmileIcon
} from "@heroicons/react/24/outline";
import {
  ItineraryProps,
  LoadingItineraryProps,
  ItineraryDetailsProps
} from '../types/global';
import { useLanguage } from '../context/LanguageContext';

const ITINERARY_DATE_FORMAT = 'DD/MM';
const ITINERARY_BADGES: { [key: string]: JSX.Element } = {
  "destination": <MapPinIcon className="h-5 w-5 text-gray-600" />,
  "startDate": <CalendarIcon className="h-5 w-5 text-gray-600" />,
  "endDate": <CalendarIcon className="h-5 w-5 text-gray-600" />,
  "accompaniment": <UserGroupIcon className="h-5 w-5 text-gray-600" />,
  "activityType": <FaceSmileIcon className="h-5 w-5 text-gray-600" />,
  "budget": <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
};

const LoadingItinerary = ({ translator }: LoadingItineraryProps) => (
  <div className="w-full h-full p-4 flex items-center justify-center">
    <div className="animate-pulse text-gray-600 px-8 text-center">{translator('itinerary-loading')}</div>
  </div>
);

const ItineraryDetails = ({ tripProperties, tripItinerary, translator, formatDate }: ItineraryDetailsProps) => (
  <div className="w-full h-full p-4 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-3xl font-bold">{`${tripProperties['destination']}`}</h2>
    </div>
    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600 mb-4">
      {Object.entries(tripProperties).map(([key, value], index) => (
        (value && value !== '' && value.length > 0) &&
        <div key={index} className="flex items-center space-x-2 bg-gray-200 rounded-full py-1 px-3 mb-2">
          {ITINERARY_BADGES[key] || null}
          <span>{key.includes('Date') ? formatDate(value) : Array.isArray(value) ? value.join(', ') : value}</span>
        </div>
      ))}
    </div>
    {tripItinerary && tripItinerary.length > 0 ? (
      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200 flex-grow overflow-y-auto">
        <h3 className="font-semibold mb-4">{translator('itinerary-title')}</h3>
        <div className="flex-1 space-y-4 mb-2">
          {tripItinerary.map((item: string, index: number) => (
            <ReactMarkdown key={index}>{item}</ReactMarkdown>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex justify-center h-96 animate-pulse text-gray-600 items-center ">
        {translator('itinerary-loading')}
      </div>
    )}
  </div>
);

export default function Itinerary({ tripProperties, tripItinerary }: ItineraryProps) {
  const [loading, setLoading] = useState(true);
  const { translator } = useLanguage();

  useEffect(() => {
    setLoading(!(tripProperties && Object.keys(tripProperties).length > 0));
  }, [tripProperties, tripItinerary]);

  const formatDate = (date: string) => dayjs(date).format(ITINERARY_DATE_FORMAT);

  if (loading) {
    return <LoadingItinerary translator={translator} />;
  }

  return (
    <ItineraryDetails
      tripProperties={tripProperties}
      tripItinerary={tripItinerary}
      translator={translator}
      formatDate={formatDate}
    />
  );
}