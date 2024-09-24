import { useState } from 'react';

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

    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: inputValue,
        threadId: threadId || null,
      }),
    });

    const data = await response.json();
    const assistantMessage = { role: ASSISTANT_ROLE, content: data.response.message };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setTripTitle(data.response.title);
    setTripProperties(data.response.properties);
    setTripItinerary(data.response.itinerary);

    if (!threadId && data.response.threadId) {
      setThreadId(data.response.threadId);
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