import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../hooks/useChat';
import TypewriterEffect from './TypewriterEffect';
import { useThrottle } from '../hooks/useThrottle';

export default function Chat() {
  const { translator, language } = useLanguage();
  const {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    assistantResponseCount,
    threadId
  } = useChat();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [tripTitle, setTripTitle] = useState('');

  const placeholders = [
    translator('chat-placeholder-1'),
    translator('chat-placeholder-2'),
    translator('chat-placeholder-3')
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useThrottle(scrollToBottom, 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    if (threadId && ((messages.length === 2) || (assistantResponseCount > 0 && assistantResponseCount % 3 === 0))) {
      fetchTripTitle();
    }
  }, [assistantResponseCount, threadId]);

  const fetchTripTitle = async () => {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: language === 'ES' ? 'dame un titulo para este viaje' : 'give me a title for this trip',
        threadId: threadId,
      }),
    });
    const data = await response.json();
    setTripTitle(data.response.message || '');
  };

  return (
    <div className="w-2/3 border-r-2 border-gray-100 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <TypewriterEffect text={tripTitle} />
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-gray-100 text-gray-800 text-right' : 'bg-white text-gray-600 text-left'
              }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto">
        <div className="flex">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholders[placeholderIndex]}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-violet-500 text-white p-3 rounded-lg shadow-sm hover:bg-violet-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}