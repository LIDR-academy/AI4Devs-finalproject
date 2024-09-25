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
  clearMessages: () => void;
  isLoading: boolean; // Añadir isLoading a las props
}

export default function Chat({ messages, inputValue, setInputValue, handleSend, tripTitle, clearMessages, isLoading }: ChatProps) {
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
        {messages.length === 0 ? (
          <div className="flex justify-center items-end h-full">
            <div className="animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
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
          ))
        )}
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
            disabled={isLoading} // Deshabilitar el input si isLoading es true
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-violet-500 text-white p-3 rounded-lg shadow-sm hover:bg-violet-600 transition-colors"
            disabled={isLoading} // Deshabilitar el botón si isLoading es true
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              translator('send')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}