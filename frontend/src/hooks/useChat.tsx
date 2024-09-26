import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import {
  saveCurrentTripId,
  getCurrentTripId
} from '../utils/sessionUtils';
import { Message } from '../types/global';
import { useLanguage } from '../context/LanguageContext';

const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

export function useChat(fetchTrips: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [tripTitle, setTripTitle] = useState<string | null>(null);
  const [tripProperties, setTripProperties] = useState<{ [key: string]: any }>({});
  const [tripItinerary, setTripItinerary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const prevTripTitle = useRef<string | null>(null);
  const prevTripProperties = useRef<{ [key: string]: any }>({});
  const prevTripItinerary = useRef<string[]>([]);
  const { translator } = useLanguage();

  const handleSend = async (forcedPrompt: string = '') => {
    if (inputValue.trim() === '' && !forcedPrompt) return;

    const prompt: string = forcedPrompt ? forcedPrompt : inputValue;
    const userMessage: Message = { role: USER_ROLE, content: prompt };

    if (!forcedPrompt) {
      setMessages((prevMessages) => [...prevMessages, userMessage]);
    } else {
      setMessages((prevMessages) => [...prevMessages, { role: USER_ROLE, content: translator('recovering-conversation') }]);
    }

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

    const replaceYear = (date: string) => {
        return date.replace(/^YYYY/, currentYear.toString());
    };

    if (updatedTripProperties.startDate) {
        updatedTripProperties.startDate = replaceYear(updatedTripProperties.startDate);
    }

    if (updatedTripProperties.endDate) {
        updatedTripProperties.endDate = replaceYear(updatedTripProperties.endDate);
    }

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setTripTitle(response.title);
    setTripProperties(updatedTripProperties);
    setTripItinerary(response.itinerary);

    if (!currentThreadId && response.threadId) {
      setCurrentThreadId(response.threadId);
    }

    if (response.tripId) {
      saveCurrentTripId(response.tripId);
    }
  };

  const clearChatSession = () => {
    setMessages([]);
    setInputValue('');
    setTripTitle(null);
    setTripProperties({});
    setTripItinerary([]);
  };

  const setTripDetails = (tripDetails: any) => {
    setTripTitle(tripDetails.description);
    setTripProperties({
      destination: tripDetails.destination,
      startDate: tripDetails.startDate,
      endDate: tripDetails.endDate,
      accompaniment: tripDetails.accompaniment,
      activityType: tripDetails.activityType,
      budgetMax: tripDetails.budgetMax,
    });

    const sortedActivities = tripDetails.activities
      .sort((a: any, b: any) => parseInt(a.sequence) - parseInt(b.sequence))
      .map((activity: any) => activity.description);

    setTripItinerary(sortedActivities);
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
    setTripDetails,
  };
}