import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import dayjs from 'dayjs';

const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

export function useChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [tripTitle, setTripTitle] = useState<string | null>(null);
  const [tripProperties, setTripProperties] = useState<{ [key: string]: any }>({});
  const [tripItinerary, setTripItinerary] = useState<string>('');

  const handleSend = async () => {
    if (inputValue.trim() === '') return;
    const userMessage = { role: USER_ROLE, content: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: inputValue,
          threadId: threadId || null,
        }),
      });

      const assistantMessage = { role: ASSISTANT_ROLE, content: data.response.message };

      // Controlar el formato de las fechas
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

      if (!threadId && data.response.threadId) {
        setThreadId(data.response.threadId);
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  useEffect(() => {
    const saveTrip = async () => {
      console.log('>>> saveTrip - Trip', tripTitle, tripProperties);
      console.log('>>> saveTrip - Itinerary', tripItinerary);

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

          // Filtrar propiedades vacías o inexistentes
          const filteredTripData = Object.fromEntries(
            Object.entries(tripData).filter(([_, value]) => value !== undefined && value !== '')
          );

          await apiFetch('/trips', {
            method: 'POST',
            body: JSON.stringify(filteredTripData),
          });
        } catch (error) {
          console.error('Error al guardar el itinerario:', error);
        }
      }
    };

    saveTrip();
  }, [tripTitle, tripProperties, tripItinerary]);

  return {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    tripTitle,
    tripProperties,
    tripItinerary
  };
}