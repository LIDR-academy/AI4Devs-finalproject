import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import {
  saveCurrentTripId,
  getCurrentTripId,
  saveCurrentThreadId,
  getCurrentThreadId,
  addNewTrip,
} from '../utils/sessionUtils';

const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

export function useChat(fetchTrips: () => void) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(getCurrentThreadId());
  const [tripTitle, setTripTitle] = useState<string | null>(null);
  const [tripProperties, setTripProperties] = useState<{ [key: string]: any }>({});
  const [tripItinerary, setTripItinerary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const prevTripTitle = useRef<string | null>(null);
  const prevTripProperties = useRef<{ [key: string]: any }>({});
  const prevTripItinerary = useRef<string[]>([]);

  const handleSend = async (forcedPrompt: string = '') => {
    if (inputValue.trim() === '' && !forcedPrompt) return;

    const prompt = forcedPrompt ? forcedPrompt : inputValue;
    const userMessage = { role: USER_ROLE, content: prompt };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: prompt,
          threadId: currentThreadId || null,
        }),
      });

      const assistantMessage = { role: ASSISTANT_ROLE, content: data.response.message };

      const currentYear = dayjs().year();
      const updatedTripProperties = { ...data.response.properties };

      if (updatedTripProperties.startDate && updatedTripProperties.startDate.match(/^\d{4}-11-20$/)) {
        updatedTripProperties.startDate = updatedTripProperties.startDate.replace(/^\d{4}/, currentYear.toString());
      }

      if (updatedTripProperties.endDate && updatedTripProperties.endDate.match(/^\d{4}-11-20$/)) {
        updatedTripProperties.endDate = updatedTripProperties.endDate.replace(/^\d{4}/, currentYear.toString());
      }

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setTripTitle(data.response.title);
      setTripProperties(updatedTripProperties);
      setTripItinerary(data.response.itinerary);

      if (!currentThreadId && data.response.threadId) {
        setCurrentThreadId(data.response.threadId);
        saveCurrentThreadId(data.response.threadId);
      }

      if (data.response.tripId) {
        saveCurrentTripId(data.response.tripId);
        addNewTrip(data.response.tripId, data.response.threadId);
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saveTrip = async () => {
      const tripTitleChanged = tripTitle !== prevTripTitle.current;
      const tripPropertiesChanged = !isEqual(tripProperties, prevTripProperties.current);
      const tripItineraryChanged = !isEqual(tripItinerary, prevTripItinerary.current);

      if (tripTitleChanged || tripPropertiesChanged || tripItineraryChanged) {
        if (tripTitle) {
          try {
            const tripData = {
              destination: tripProperties.destination,
              startDate: tripProperties.startDate,
              endDate: tripProperties.endDate,
              description: tripTitle,
              accompaniment: tripProperties.accompaniment,
              activityType: tripProperties.activityType,
              budgetMax: tripProperties.budgetMax,
            };

            const filteredTripData = Object.fromEntries(
              Object.entries(tripData).filter(([_, value]) => value !== undefined && value !== '')
            );

            if (getCurrentTripId()) {
              await apiFetch(`/trips/${getCurrentTripId()}`, {
                method: 'PUT',
                body: JSON.stringify(filteredTripData),
              });
            } else {
              const response = await apiFetch('/trips', {
                method: 'POST',
                body: JSON.stringify(filteredTripData),
              });

              saveCurrentTripId(response.id);
              fetchTrips();
            }

          } catch (error) {
            console.error('Error al guardar el itinerario:', error);
          }

          if (Array.isArray(tripItinerary)) {
            try {
              await apiFetch(`/trips/${getCurrentTripId()}/activities/all`, {
                method: 'POST',
                body: JSON.stringify({
                  "activities": tripItinerary,
                }),
              });
            } catch (error) {
              console.error('Error al guardar el itinerario:', error);
            }
          }
        }

        prevTripTitle.current = tripTitle;
        if (tripProperties) { 
          prevTripProperties.current = { ...tripProperties };
        }
        if (tripItinerary && tripItinerary.length > 0) {
          prevTripItinerary.current = [...tripItinerary];
        }
      }
    };

    saveTrip();
  }, [tripTitle, tripProperties, tripItinerary, fetchTrips]);

  const clearMessages = () => {
    setMessages([]);
    setInputValue(''); 
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    tripTitle,
    tripProperties,
    tripItinerary,
    clearMessages,
    setCurrentThreadId,
    isLoading,
  };
}