import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bars3Icon, CalendarIcon } from '@heroicons/react/24/outline';
import TypewriterEffect from '../utils/typewriter';
import Sidebar from './Sidebar';
import Itinerary from './Itinerary';
import { useLanguage } from '../context/LanguageContext';

const MessageList = ({ messages }: MessageListProps) => (
  <div className="flex-1 overflow-y-auto mb-4">
    {messages.length === 0 ? (
      <div className="flex justify-center items-end h-full">
        <div className="animate-bounce bg-white p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-violet-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    ) : (
      <div className="h-96 lg:h-full flex flex-col space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg shadow-sm ${msg.role === 'user'
                ? 'bg-gray-100 text-gray-800 self-end'
                : 'bg-white text-gray-600 self-start'
              } max-w-xs lg:max-w-96 break-words`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ChatInput = ({ inputValue, setInputValue, handleSend, isLoading, placeholder, translator }: ChatInputProps) => (
  <div className="mt-auto">
    <div className="flex">
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
        disabled={isLoading}
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-violet-500 text-white p-3 rounded-lg shadow-sm hover:bg-violet-600 transition-colors"
        disabled={isLoading}
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
);

export default function Chat({ messages, inputValue, setInputValue, handleSend, tripTitle, isLoading, tripProperties, tripItinerary }: ChatProps) {
  const { translator } = useLanguage();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);

  const placeholders = [
    translator('chat-placeholder-1'),
    translator('chat-placeholder-2'),
    translator('chat-placeholder-3')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col border-r-2 border-gray-100">
      <header className="flex justify-between items-end p-4 border-b-2 border-gray-100 lg:hidden sticky top-0 bg-white">
        <button onClick={() => setIsSidebarOpen(true)}>
          <Bars3Icon className="h-6 w-6 text-violet-500" />
        </button>
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3vqK1WAdvhcavo10sL6QxLv3IdVRd.png"
          alt="IkiGoo Logo"
          className="h-28"
        />
        <button onClick={() => setIsItineraryOpen(true)}>
          <CalendarIcon className="h-6 w-6 text-violet-500" />
        </button>
      </header>
      <div className="flex-grow flex flex-col p-4 h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold"><TypewriterEffect text={tripTitle || ''} /></h1>
        </div>
        <MessageList messages={messages} />
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          isLoading={isLoading}
          placeholder={placeholders[placeholderIndex]}
          translator={translator}
        />
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 w-3/4 h-full bg-white shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}
      {isItineraryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setIsItineraryOpen(false)}>
          <div className="absolute right-0 top-0 w-3/4 h-full bg-white shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Itinerary tripProperties={tripProperties} tripItinerary={tripItinerary} />
          </div>
        </div>
      )}
    </div>
  );
}