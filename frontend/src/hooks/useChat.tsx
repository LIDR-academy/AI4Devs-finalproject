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
import { Message } from '../types/global';
const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

export function useChat(fetchTrips: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
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

    const prompt: string = forcedPrompt ? forcedPrompt : inputValue;
    const userMessage: Message = { role: USER_ROLE, content: prompt };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: prompt,
          threadId: currentThreadId && currentThreadId !== '' ? currentThreadId : null,
        }),
      });

      processAssistantResponse(data.response);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAssistantResponse = (response: any) => {
    const assistantMessage: Message = { role: ASSISTANT_ROLE, content: response.message };

    const currentYear = dayjs().year();
    const updatedTripProperties = { ...response.properties };

    if (updatedTripProperties.startDate && updatedTripProperties.startDate.match(/^\d{4}-11-20$/)) {
      updatedTripProperties.startDate = updatedTripProperties.startDate.replace(/^\d{4}/, currentYear.toString());
    }

    if (updatedTripProperties.endDate && updatedTripProperties.endDate.match(/^\d{4}-11-20$/)) {
      updatedTripProperties.endDate = updatedTripProperties.endDate.replace(/^\d{4}/, currentYear.toString());
    }

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setTripTitle(response.title);
    setTripProperties(updatedTripProperties);
    setTripItinerary(response.itinerary);

    if (!currentThreadId && response.threadId) {
      setCurrentThreadId(response.threadId);
      saveCurrentThreadId(response.threadId);
    }

    if (response.tripId) {
      saveCurrentTripId(response.tripId);
      addNewTrip(response.tripId, response.threadId);
    }
  };

  const clearChatSession = () => {
    setMessages([]);
    setInputValue(''); 
    setTripTitle(null);
    setTripProperties({});
    setTripItinerary([]);
  };

  useEffect(() => {
    const saveTrip = async () => {
      const tripTitleChanged = tripTitle !== prevTripTitle.current;
      const tripPropertiesChanged = !isEqual(tripProperties, prevTripProperties.current);
      const tripItineraryChanged = !isEqual(tripItinerary, prevTripItinerary.current);
  
      if (tripTitleChanged || tripPropertiesChanged || tripItineraryChanged) {
        if (tripTitle) {
          await saveTripData();
          await saveTripItinerary();
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
  
    const saveTripData = async () => {
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
    };

    const saveTripItinerary = async () => {
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
    };

    saveTrip();
  }, [tripTitle, tripProperties, tripItinerary, fetchTrips]);

  return {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    tripTitle,
    tripProperties,
    tripItinerary,
    clearChatSession,
    setCurrentThreadId,
    isLoading,
  };
}