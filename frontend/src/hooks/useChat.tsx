import { useState } from 'react';
import { apiFetch } from '../utils/api';

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

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setTripTitle(data.response.title);
      setTripProperties(data.response.properties);
      setTripItinerary(data.response.itinerary);

      if (!threadId && data.response.threadId) {
        setThreadId(data.response.threadId);
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

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