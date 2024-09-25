import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import TypewriterEffect from './TypewriterEffect';

interface ChatProps {
  messages: { role: string; content: string }[];
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSend: () => void;
  tripTitle: string | null;
}

export default function Chat({ messages, inputValue, setInputValue, handleSend, tripTitle }: ChatProps) {
  const { translator } = useLanguage();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    translator('chat-placeholder-1'),
    translator('chat-placeholder-2'),
    translator('chat-placeholder-3')
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <div className="w-1/2 border-r-2 border-gray-100 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"><TypewriterEffect text={tripTitle || ''} /></h1>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gray-100 text-gray-800 text-right' 
                : 'bg-white text-gray-600 text-left'
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
            {translator('send')}
          </button>
        </div>
      </div>
    </div>
  );
}